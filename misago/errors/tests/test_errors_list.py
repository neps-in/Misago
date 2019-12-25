import pytest

from .. import EmailNotAvailableError, UsernameNotAvailableError
from ..errorslist import ErrorsList


@pytest.fixture
def errors_list():
    return ErrorsList()


def test_error_is_added_to_errors_list(errors_list):
    errors_list.add_error("username", UsernameNotAvailableError())
    assert errors_list == [
        {
            "loc": ("username",),
            "msg": UsernameNotAvailableError.msg_template,
            "type": "value_error." + UsernameNotAvailableError.code,
        }
    ]


def test_duplicate_error_is_not_added_to_errors_list(errors_list):
    errors_list.add_error("username", UsernameNotAvailableError())
    errors_list.add_error("username", UsernameNotAvailableError())
    assert errors_list == [
        {
            "loc": ("username",),
            "msg": UsernameNotAvailableError.msg_template,
            "type": "value_error." + UsernameNotAvailableError.code,
        }
    ]


def test_two_errors_lists_can_be_combined():
    first_list = ErrorsList()
    first_list.add_error("email", EmailNotAvailableError())

    other_list = ErrorsList()
    other_list.add_error("username", UsernameNotAvailableError())

    errors_list = first_list + other_list

    assert isinstance(errors_list, ErrorsList)
    assert errors_list == [
        {
            "loc": ("email",),
            "msg": EmailNotAvailableError.msg_template,
            "type": "value_error." + EmailNotAvailableError.code,
        },
        {
            "loc": ("username",),
            "msg": UsernameNotAvailableError.msg_template,
            "type": "value_error." + UsernameNotAvailableError.code,
        },
    ]


def test_combining_errors_lists_removes_duplicates():
    first_list = ErrorsList()
    first_list.add_error("email", EmailNotAvailableError())
    first_list.add_error("username", UsernameNotAvailableError())

    other_list = ErrorsList()
    other_list.add_error("username", UsernameNotAvailableError())

    errors_list = first_list + other_list
    assert errors_list == [
        {
            "loc": ("email",),
            "msg": EmailNotAvailableError.msg_template,
            "type": "value_error." + EmailNotAvailableError.code,
        },
        {
            "loc": ("username",),
            "msg": UsernameNotAvailableError.msg_template,
            "type": "value_error." + UsernameNotAvailableError.code,
        },
    ]


def test_locations_can_be_obtained_from_errors_list(errors_list):
    errors_list.add_error("username", UsernameNotAvailableError())
    assert errors_list.get_errors_locations() == ["username"]


def test_types_can_be_obtained_from_errors_list(errors_list):
    errors_list.add_error("username", UsernameNotAvailableError())
    assert errors_list.get_errors_types() == [
        "value_error." + UsernameNotAvailableError.code
    ]


def test_root_error_is_added_to_errors_list(errors_list):
    errors_list.add_root_error(UsernameNotAvailableError())
    assert errors_list == [
        {
            "loc": ("__root__",),
            "msg": UsernameNotAvailableError.msg_template,
            "type": "value_error." + UsernameNotAvailableError.code,
        }
    ]
