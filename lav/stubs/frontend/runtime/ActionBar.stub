"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchActions, runAction, type ActionMeta } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Props = { entity: string; scope?: "toolbar" | "row" | "bulk" | "detail"; selectedIds?: Array<number|string>; onDone?: () => void; };

export default function ActionBar({ entity, scope = "toolbar", selectedIds = [], onDone }: Props) {
  const [actions, setActions] = useState<ActionMeta[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchActions(entity).then(setActions).catch(console.error); }, [entity]);
  const visible = useMemo(() => actions.filter(a => a.position === scope), [actions, scope]);

  const submit = async (a: ActionMeta) => {
    setBusy(true);
    const addIds = (data: any) => {
      if (scope === "bulk" || scope === "row") {
        if (data instanceof FormData) data.append("ids", JSON.stringify(selectedIds));
        else data = { ...(data || {}), ids: selectedIds };
      }
      return data;
    };

    try {
      if (a.ui?.method === "GET" && a.ui?.download === "stream") {
        const qs = new URLSearchParams(formState as Record<string,string>).toString();
        window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/${entity}/actions/${a.key}?${qs}`, "_blank");
      } else if (a.ui?.type === "file") {
        if (!file) return;
        const fd = new FormData(); fd.append("file", file);
        await runAction(entity, a.key, addIds(fd));
      } else if (a.ui?.type === "form") {
        await runAction(entity, a.key, addIds(formState), a.ui?.method || "POST");
      } else {
        await runAction(entity, a.key, addIds(undefined), a.ui?.method || "POST");
      }
      setOpenKey(null); setFormState({}); setFile(null); onDone?.();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  if (!visible.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((a) =>
        a.ui?.type && a.ui.type !== "none" ? (
          <Dialog key={a.key} open={openKey === a.key} onOpenChange={(v) => setOpenKey(v ? a.key : null)}>
            <DialogTrigger asChild><Button variant="secondary">{a.label}</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{a.ui?.title || a.label}</DialogTitle></DialogHeader>

              {a.ui?.type === "file" && (<Input type="file" accept={a.ui?.accept || "*/*"} onChange={(e) => setFile(e.target.files?.[0] || null)} />)}
              {a.ui?.type === "form" && (a.ui?.fields || []).map((f) => (
                <div key={f.name} className="space-y-1">
                  <label className="text-sm">{f.label}</label>
                  <Input type={f.input || "text"} placeholder={f.placeholder || ""} onChange={(e) => setFormState((s) => ({ ...s, [f.name]: e.target.value }))} />
                </div>
              ))}

              <div className="flex justify-end">
                <Button disabled={busy} onClick={() => submit(a)}>{busy ? "Memproses..." : "Jalankan"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button key={a.key} variant="secondary" disabled={busy} onClick={() => submit(a)}>{a.label}</Button>
        )
      )}
    </div>
  );
}
