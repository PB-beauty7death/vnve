import React from "react";
import { findNode, moveSelection } from "@udecode/plate-common";
import {
  focusEditor,
  useComposedRef,
  useEditorPlugin,
  useHotkeys,
  useOnClickOutside,
} from "@udecode/plate-common/react";
import {
  type UseVirtualFloatingOptions,
  useVirtualFloating,
  getSelectionBoundingClientRect,
} from "@udecode/plate-floating";
import { useFocused } from "slate-react";
import {
  DirectivePlugin,
  TDirectiveElement,
  TDirectiveValue,
} from "./DirectivePlugin";

export function useFloatingDirective({
  triggerFloatingLinkHotkeys,
  floatingOptions,
}: {
  triggerFloatingLinkHotkeys: string;
  floatingOptions: UseVirtualFloatingOptions;
}) {
  const { editor, api, tf, useOption, setOption, getOptions } =
    useEditorPlugin(DirectivePlugin);
  const mode = useOption("mode");
  const isOpen = useOption("isOpen", editor.id);
  const editingDirective = useOption("editingDirective");
  const floating = useVirtualFloating({
    onOpenChange: (open) => setOption("openEditorId", open ? editor.id : null),
    getBoundingClientRect: getSelectionBoundingClientRect,
    open: isOpen && ["insert", "edit"].includes(mode),
    whileElementsMounted: () => {},
    ...floatingOptions,
  });
  const focused = useFocused();

  const ref = useOnClickOutside(
    () => {
      // TODO: 与select选择存在冲突，暂时禁用
      // if (["insert", "edit"].includes(getOptions().mode)) {
      //   api.floatingDirective.hide();
      //   focusEditor(editor, editor.selection!);
      // }
    },
    {
      disabled: !isOpen,
    },
  );

  // wait for update before focusing input
  React.useEffect(() => {
    if (isOpen) {
      floating.update();
      // setOption("updated", true);
    } else {
      // setOption("updated", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, floating.update]);

  // TODO: hotkeys
  // useHotkeys(
  //   triggerFloatingLinkHotkeys!,
  //   (e) => {
  //     if (triggerFloatingLinkInsert(editor, { focused })) {
  //       e.preventDefault();
  //     }
  //   },
  //   {
  //     enableOnContentEditable: true,
  //   },
  //   [focused],
  // );

  // TODO: do quick escape
  // useFloatingLinkEscape();

  const onInsert = (value: TDirectiveValue) => {
    tf.insert.directive({ value });

    // move the selection after the element
    moveSelection(editor, { unit: "offset" });

    api.floatingDirective.hide();
    // ??
    setTimeout(() => {
      focusEditor(editor, editor.selection!);
    }, 0);
  };

  const onEdit = (value: TDirectiveValue) => {
    const at = editor.selection;
    const [, hitPath] = findNode<TDirectiveElement>(editor, {
      at,
      match: { type: editor.getType(DirectivePlugin), id: editingDirective.id },
    });
    tf.edit.directive({
      value,
      at: hitPath,
    });

    api.floatingDirective.hide();
  };

  const onSubmit = (value: TDirectiveValue) => {
    if (editingDirective) {
      onEdit(value);
    } else {
      onInsert(value);
    }
  };

  const onCancel = () => {
    api.floatingDirective.hide();
    focusEditor(editor, editor.selection!);
  };

  return {
    props: {
      style: {
        ...floating.style,
        zIndex: 50,
      },
    },
    ref: useComposedRef<HTMLDivElement>(floating.refs.setFloating, ref),
    onSubmit,
    onCancel,
  };
}
