import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { assetDB, DBAsset, DBAssetType } from "@/db";
import { useAssetStore } from "@/store";
import { assetLibraryCache } from "./AssetLibraryCache";

export function AssetLibrary() {
  const isOpen = useAssetStore((state) => state.isOpen);
  const confirm = useAssetStore((state) => state.confirm);
  const cancel = useAssetStore((state) => state.cancel);
  const type = useAssetStore((state) => state.type);
  const [assetName, setAssetName] = useState("");
  const [assetStateName, setAssetStateName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // TODO: 额外需要支持一种禁用状态，只选择角色/背景/音乐/音效
  const assets = useLiveQuery(() =>
    assetDB.where("type").anyOf(DBAssetType.Character).reverse().toArray(),
  );
  const [assetList, setAssetList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = [];
      for (const asset of assets) {
        const states = [];

        for (const state of asset.states) {
          const extState = await assetLibraryCache.get(state.id);
          states.push({
            ...state,
            url: extState.url,
          });
        }

        result.push({
          ...asset,
          states,
        });
      }

      setAssetList(result);
    };

    if (assets) {
      fetchData();
    }
  }, [assets]);

  const handleAddAsset = () => {
    assetDB.add({
      name: assetName,
      type: DBAssetType.Character,
      states: [],
    });
  };

  const handleDeleteAsset = (asset: DBAsset) => {
    asset.states.forEach((state) => {
      assetLibraryCache.delete(state.id);
    });

    assetDB.delete(asset.id);
  };

  const handleAddAssetState = async (asset: DBAsset) => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const file = fileInputRef.current.files[0];

      if (file) {
        const id = await assetLibraryCache.add({
          mime: file.type,
          blob: file,
        });

        assetDB
          .where("id")
          .equals(asset.id)
          .modify((item) => item.states.push({ id, name: assetStateName }));
      }
    }
  };

  const handleDeleteAssetState = (asset: DBAsset, id: number) => {
    assetLibraryCache.delete(id);
    assetDB
      .where("id")
      .equals(asset.id)
      .modify((item) => {
        item.states = item.states.filter((state) => state.id !== id);
      });
  };

  const handleClose = () => {
    cancel();
    assetLibraryCache.clearCache(); // 关闭时，清空缓存的blob URL
  };

  return (
    isOpen && (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-200">
        AssetLibrary <Button onClick={handleClose}>关闭</Button>
        <input
          type="text"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
        />
        <Button onClick={handleAddAsset}>add Asset</Button>
        <ul>
          {assetList?.map((asset) => {
            return (
              <li key={asset.id}>
                <p onClick={() => confirm(asset)}>
                  {asset.id} {asset.name}
                </p>
                <Button onClick={() => handleDeleteAsset(asset)}>delete</Button>

                <ul>
                  {asset.states.map((state) => {
                    return (
                      <li key={state.id}>
                        <b>{state.name}</b>
                        <img
                          className="w-[160px] h-[90px]"
                          src={state.url}
                          alt={state.name}
                        />
                        <Button
                          onClick={() =>
                            handleDeleteAssetState(asset, state.id)
                          }
                        >
                          delete AssetState
                        </Button>
                      </li>
                    );
                  })}

                  <li>
                    <input
                      type="text"
                      value={assetStateName}
                      onChange={(e) => setAssetStateName(e.target.value)}
                    />
                    <input type="file" ref={fileInputRef} />
                    <Button onClick={() => handleAddAssetState(asset)}>
                      add AssetState
                    </Button>
                  </li>
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    )
  );
}
