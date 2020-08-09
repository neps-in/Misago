import { Trans } from "@lingui/macro"
import React from "react"
import {
  ButtonDark,
  Dropdown,
  DropdownButton,
  DropdownDivider,
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
} from "../../../UI"
import FixedContainer from "../../../UI/FixedContainer"
import { IThreadsModeration } from "../Threads.types"

interface IThreadsModerationProps {
  moderation?: IThreadsModeration | null
  selection: {
    selected: Array<any>
    clear: () => void
  }
}

const ThreadsModeration: React.FC<IThreadsModerationProps> = ({
  moderation,
  selection,
}) => {
  if (!moderation) return null

  return (
    <FixedContainer show={!moderation.disabled}>
      <Toolbar>
        <ToolbarSeparator />
        <ToolbarItem>
          <Dropdown
            toggle={({ ref, toggle }) => (
              <ButtonDark
                elementRef={ref}
                loading={moderation.loading}
                text={
                  <Trans id="moderate_threads">
                    Moderate threads ({selection.selected.length})
                  </Trans>
                }
                icon="shield-alt"
                iconSolid
                responsive
                onClick={toggle}
              />
            )}
            menu={() => (
              <>
                {moderation.actions.map((action) => (
                  <DropdownButton
                    key={action.icon}
                    text={action.name}
                    icon={action.icon}
                    iconSolid={action.iconSolid}
                    onClick={action.action}
                  />
                ))}
                <DropdownDivider />
                {selection && (
                  <DropdownButton
                    text={<Trans id="clear_selection">Clear selection</Trans>}
                    icon="square"
                    onClick={selection.clear}
                  />
                )}
              </>
            )}
          />
        </ToolbarItem>
      </Toolbar>
    </FixedContainer>
  )
}

export default ThreadsModeration