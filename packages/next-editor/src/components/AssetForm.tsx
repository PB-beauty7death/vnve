import {
  assetDB,
  assetSourceDB,
  DBAsset,
  DBAssetTypeNameMap,
  DBAssetType,
  getAssetSourceURL,
} from "@/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DBAssetForm } from "./AssetLibrary";

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, {
    message: "名称必填",
  }),
  type: z.string().min(1, {
    message: "类型必选",
  }),
  states: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1, {
          message: "名称必填",
        }),
        ext: z.string().optional(),
        file: z.any().optional(),
      }),
    )
    .min(1, {
      message: "至少需要一个状态",
    }),
});

export function AssetForm({
  asset,
  onSubmit,
  onCancel,
}: {
  asset: DBAsset;
  onSubmit: (asset: DBAssetForm) => void;
  onCancel: () => void;
}) {
  const assetTypeName = useMemo(
    () => DBAssetTypeNameMap[asset.type],
    [asset.type],
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      states: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "states",
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  useEffect(() => {
    form.reset({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      states: asset.states,
    });
  }, [asset, form]);

  return (
    <div>
      <h3 className="text-base font-bold mb-4">
        {asset.id ? "编辑" : "新增"}
        {assetTypeName}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{assetTypeName}名</FormLabel>
                <FormControl>
                  <Input placeholder={`请输入${assetTypeName}名`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>{assetTypeName}状态</FormLabel>
            <FormControl>
              <div>
                {fields.length > 0 && (
                  <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
                    <div className="flex w-max space-x-4 p-4">
                      {fields.map((field, index) => (
                        <figure key={index} className="shrink-0">
                          <div className="overflow-hidden rounded-md">
                            <img
                              src={
                                asset.states[index]?.id
                                  ? getAssetSourceURL(
                                      asset.states[index].id,
                                      asset.states[index].ext,
                                    )
                                  : ""
                              }
                              className="aspect-[9/16] h-[160px] w-[90px] object-cover"
                            />
                          </div>
                          <figcaption className="pt-2 text-xs text-muted-foreground">
                            <FormField
                              control={form.control}
                              name={`states.${index}.name`}
                              render={({ field }) => (
                                <Input
                                  placeholder={`请输入${assetTypeName}状态名`}
                                  {...field}
                                />
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`states.${index}.file`}
                              render={({ field }) => (
                                <Input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    form.setValue(`states.${index}.file`, file);
                                  }}
                                />
                              )}
                            />
                            <Button
                              type="button"
                              onClick={() => remove(index)}
                              className="self-end"
                            >
                              删除
                            </Button>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
                <Button
                  size="sm"
                  type="button"
                  onClick={() => append({ name: "" })}
                  className="self-end"
                >
                  添加
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>

          <Button className="mr-2" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit">确定</Button>
        </form>
      </Form>
    </div>
  );
}