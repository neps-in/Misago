from typing import Optional, Protocol

from ..types import GraphQLContext, ParsedMarkupMetadata, RichTextBlock
from .filter import FilterHook


class ConvertBlockAstToRichTextAction(Protocol):
    def __call__(
        self, context: GraphQLContext, ast: dict, metadata: ParsedMarkupMetadata
    ) -> Optional[RichTextBlock]:
        ...


class ConvertBlockAstToRichTextFilter(Protocol):
    def __call__(
        self,
        action: ConvertBlockAstToRichTextAction,
        context: GraphQLContext,
        ast: dict,
        metadata: ParsedMarkupMetadata,
    ) -> Optional[RichTextBlock]:
        ...


class ConvertBlockAstToRichTextHook(
    FilterHook[ConvertBlockAstToRichTextAction, ConvertBlockAstToRichTextFilter]
):
    is_async = False

    def call_action(
        self,
        action: ConvertBlockAstToRichTextAction,
        context: GraphQLContext,
        ast: dict,
        metadata: ParsedMarkupMetadata,
    ) -> Optional[RichTextBlock]:
        return self.filter(action, context, ast, metadata)


convert_block_ast_to_rich_text_hook = ConvertBlockAstToRichTextHook()
