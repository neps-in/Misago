from typing import Optional, Protocol

from ..types import GraphQLContext, ParsedMarkupMetadata
from .filter import FilterHook


class ConvertInlineAstToTextAction(Protocol):
    def __call__(
        self,
        context: GraphQLContext,
        ast: dict,
        metadata: ParsedMarkupMetadata,
    ) -> Optional[str]:
        ...


class ConvertInlineAstToTextFilter(Protocol):
    def __call__(
        self,
        action: ConvertInlineAstToTextAction,
        context: GraphQLContext,
        ast: dict,
        metadata: ParsedMarkupMetadata,
    ) -> Optional[str]:
        ...


class ConvertInlineAstToTextHook(
    FilterHook[ConvertInlineAstToTextAction, ConvertInlineAstToTextFilter]
):
    is_async = False

    def call_action(
        self,
        action: ConvertInlineAstToTextAction,
        context: GraphQLContext,
        ast: dict,
        metadata: ParsedMarkupMetadata,
    ) -> Optional[str]:
        return self.filter(action, context, ast, metadata)


convert_inline_ast_to_text_hook = ConvertInlineAstToTextHook()
