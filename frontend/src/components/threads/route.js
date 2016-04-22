import React from 'react'; // jshint ignore:line
import Button from 'misago/components/button'; // jshint ignore:line
import PageLead from 'misago/components/page-lead'; // jshint ignore:line
import { compareGlobalWeight, compareWeight } from 'misago/components/threads/compare'; // jshint ignore:line
import Header from 'misago/components/threads/header/root'; // jshint ignore:line
import { diffThreads, getModerationActions, getPageTitle, getTitle } from 'misago/components/threads/utils'; // jshint ignore:line
import ThreadsList from 'misago/components/threads-list/root'; // jshint ignore:line
import ThreadsListEmpty from 'misago/components/threads/list-empty'; // jshint ignore:line
import Toolbar from 'misago/components/threads/toolbar'; // jshint ignore:line
import misago from 'misago/index';
import { append, hydrate, patch } from 'misago/reducers/threads'; // jshint ignore:line
import ajax from 'misago/services/ajax';
import polls from 'misago/services/polls';
import snackbar from 'misago/services/snackbar';
import store from 'misago/services/store';
import title from 'misago/services/page-title';
import * as sets from 'misago/utils/sets'; // jshint ignore:line

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isMounted: true,

      isLoaded: false,
      isBusy: false,

      diff: {
        results: []
      },

      moderation: [],
      selection: [],
      busyThreads: [],

      dropdown: false,
      subcategories: [],

      count: 0,
      more: 0,

      page: 1,
      pages: 1
    };

    let category = null;
    if (!this.props.route.category.special_role) {
      category = this.props.route.category.id;
    }

    if (misago.has('THREADS')) {
      this.initWithPreloadedData(category, misago.get('THREADS'));
    } else {
      this.initWithoutPreloadedData(category);
    }
  }

  initWithPreloadedData(category, data) {
    this.state = Object.assign(this.state, {
      moderation: getModerationActions(data.results),

      subcategories: data.subcategories,

      count: data.count,
      more: data.more,

      page: data.page,
      pages: data.pages
    });

    this.startPolling(category);
  }

  initWithoutPreloadedData(category) {
    this.loadThreads(category);
  }

  loadThreads(category, page=1) {
    ajax.get(misago.get('THREADS_API'), {
      category: category,
      list: this.props.route.list.type,
      page: page || 1
    }, 'threads').then((data) => {
      if (!this.state.isMounted) {
        // user changed route before loading completion
        return;
      }

      if (page === 1) {
        store.dispatch(hydrate(data.results));
      } else {
        store.dispatch(append(data.results, this.getSorting()));
      }

      this.setState({
        isLoaded: true,
        isBusy: false,

        moderation: getModerationActions(store.getState().threads),

        subcategories: data.subcategories,

        count: data.count,
        more: data.more,

        page: data.page,
        pages: data.pages
      });

      this.startPolling(category);
    }, (rejection) => {
      snackbar.apiError(rejection);
    });
  }

  startPolling(category) {
    polls.start({
      poll: 'threads',
      url: misago.get('THREADS_API'),
      data: {
        category: category,
        list: this.props.route.list.type
      },
      frequency: 120 * 1000,
      update: this.pollResponse
    });
  }

  componentDidMount() {
    title.set(getPageTitle(this.props.route));

    if (misago.has('THREADS')) {
      // unlike in other components, routes are root components for threads
      // so we can't dispatch store action from constructor
      store.dispatch(hydrate(misago.pop('THREADS').results));

      this.setState({
        isLoaded: true
      });
    }
  }

  componentWillUnmount() {
    this.state.isMounted = false;
    polls.stop('threads');
  }

  getTitle() {
    return getTitle(this.props.route);
  }

  getSorting() {
    if (this.props.route.category.special_role) {
      return compareGlobalWeight;
    } else {
      return compareWeight;
    }
  }

  /* jshint ignore:start */

  // AJAX

  loadMore = () => {
    this.setState({
      isBusy: true
    });

    this.loadThreads(this.state.page + 1);
  };

  pollResponse = (data) => {
    this.setState({
      diff: Object.assign({}, data, {
        results: diffThreads(this.props.threads, data.results)
      })
    });
  };

  applyDiff = () => {
    store.dispatch(append(this.state.diff.results, this.getSorting()));

    this.setState(Object.assign({}, this.state.diff, {
      moderation: getModerationActions(store.getState().threads),

      diff: {
        results: []
      }
    }));
  };

  // Selection

  getSelectedThreads = () => {
    return this.props.threads.filter((thread) => {
      return this.state.selection.indexOf(thread.id) >= 0;
    });
  };

  selectThread = (thread) => {
    this.setState({
      selection: sets.toggle(this.state.selection, thread)
    });
  };

  selectAll = () => {
    this.setState({
      selection: this.props.threads.map(function(thread) {
        return thread.id;
      })
    });
  };

  selectNone = () => {
    this.setState({
      selection: []
    });
  };

  // Thread state utils

  freezeThread = (thread) => {
    this.setState({
      busyThreads: sets.toggle(this.state.busyThreads, thread)
    });
  };

  // Thread

  updateThread = (thread) => {
    store.dispatch(patch(thread, thread, this.getSorting()));
  };
  /* jshint ignore:end */

  getCompactNav() {
    if (this.props.route.lists.length > 1) {
      /* jshint ignore:start */
      return <CompactNav baseUrl={this.props.route.category.absolute_url}
                         list={this.props.route.list}
                         lists={this.props.route.lists}
                         hideNav={this.hideNav} />;
      /* jshint ignore:end */
    } else {
      return null;
    }
  }

  getCategoryDescription() {
    if (this.props.route.category.description) {
      /* jshint ignore:start */
      return <div className="category-description">
        <PageLead copy={this.props.route.category.description.html} />
      </div>;
      /* jshint ignore:end */
    } else {
      return null;
    }
  }

  getToolbarLabel() {
    if (this.state.isLoaded) {
      let label = null;
      if (this.props.route.list.path) {
        label = ngettext(
          "%(threads)s thread found.",
          "%(threads)s threads found.",
          this.state.count);
      } else if (this.props.route.category.parent) {
        label = ngettext(
          "There is %(threads)s thread in this category.",
          "There are %(threads)s threads in this category.",
          this.state.count);
      } else {
        label = ngettext(
          "There is %(threads)s thread on our forums.",
          "There are %(threads)s threads on our forums.",
          this.state.count);
      }

      return interpolate(label, {
        threads: this.state.count
      }, true);
    } else {
      return gettext("Loading threads...");
    }
  }

  getToolbar() {
    if (this.state.subcategories.length || this.props.user.id) {
      /* jshint ignore:start */
      return <Toolbar subcategories={this.state.subcategories}
                      categories={this.props.route.categoriesMap}
                      list={this.props.route.list}

                      threads={this.props.threads}
                      selection={this.state.selection}
                      moderation={this.state.moderation}

                      freezeThread={this.freezeThread}
                      updateThread={this.updateThread}

                      isLoaded={this.state.isLoaded}
                      user={this.props.user}>
        {this.getToolbarLabel()}
      </Toolbar>;
      /* jshint ignore:end */
    } else {
      return null;
    }
  }

  getMoreButton() {
    if (this.state.more) {
      /* jshint ignore:start */
      return <div className="pager-more">
        <Button loading={this.state.isBusy || this.state.busyThreads.length}
                onClick={this.loadMore}>
          {gettext("Show more")}
        </Button>
      </div>;
      /* jshint ignore:end */
    } else {
      return null;
    }
  }

  getClassName() {
    let className = 'page page-threads';
    className += ' page-threads-' + this.props.route.list;
    if (this.props.route.category.css_class) {
      className += ' page-' + this.props.route.category.css_class;
    }
    return className;
  }

  render() {
    /* jshint ignore:start */
    return <div className={this.getClassName()}>

      <Header disabled={!this.state.isLoaded}
              threads={this.props.threads}
              title={this.getTitle()}
              route={this.props.route}
              user={this.props.user} />

      <div className="container">

        {this.getCategoryDescription()}
        {this.getToolbar()}

        <ThreadsList user={this.props.user}
                     threads={this.props.threads}
                     categories={this.props.route.categoriesMap}
                     list={this.props.route.list}

                     diffSize={this.state.diff.results.length}
                     applyDiff={this.applyDiff}

                     selectThread={this.selectThread}
                     selection={this.state.selection}
                     busyThreads={this.state.busyThreads}

                     isLoaded={this.state.isLoaded}>
          <ThreadsListEmpty category={this.props.route.category}
                            list={this.props.route.list} />
        </ThreadsList>

        {this.getMoreButton()}

      </div>
    </div>;
    /* jshint ignore:end */
  }
}