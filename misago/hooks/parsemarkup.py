from typing import Awaitable, Protocol, Tuple

from ..types import GraphQLContext, ParsedMarkupMetadata, RichText
from .filter import FilterHook


class ParseMarkupAction(Protocol):
    async def __call__(
        self, context: GraphQLContext, markup: str, metadata: ParsedMarkupMetadata
    ) -> Tuple[RichText, ParsedMarkupMetadata]:
        ...


class ParseMarkupFilter(Protocol):
    async def __call__(
        self,
        action: ParseMarkupAction,
        context: GraphQLContext,
        markup: str,
        metadata: ParsedMarkupMetadata,
    ) -> Tuple[RichText, ParsedMarkupMetadata]:
        ...


class ParseMarkupHook(FilterHook[ParseMarkupAction, ParseMarkupFilter]):
    def call_action(
        self,
        action: ParseMarkupAction,
        context: GraphQLContext,
        markup: str,
        metadata: ParsedMarkupMetadata,
    ) -> Awaitable[Tuple[RichText, ParsedMarkupMetadata]]:
        return self.filter(action, context, markup, metadata)


parse_markup_hook = ParseMarkupHook()
