"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { ContentLink, EditableChoice, EditableImage, EditableText } from "../editable";
import { styles } from "./styles";
import { AtlasPlanet } from "./atlas-planet";

interface ExplorerProps {
  items: ContentItem[];
  editable: boolean;
  feedback: boolean;
  editItem: <K extends keyof ContentItem>(index: number, field: K, value: ContentItem[K]) => void;
}

const twoDigits = (number: number) => String(number).padStart(2, "0");
const worldOrder = ["proven", "modern", "hybrid", "next"];
/** The planet of a service world: 0 Jupiter, 1 Neptune, 2 Saturn, 3 Moon. The opening journey uses the same pairing. */
export const worldIndex = (item: ContentItem, index: number) => worldOrder.includes(item.id) ? worldOrder.indexOf(item.id) : index % 4;

function useExplorer({ items, editable, feedback }: ExplorerProps, storageKey?: string) {
  const id = useId();
  const [selected, setSelected] = useState<string>();
  const current = Math.max(0, items.findIndex(item => item.id === selected));
  const currentId = items[current]?.id;
  const panel = useRef<HTMLDivElement>(null);
  const previous = useRef(currentId);

  useEffect(() => {
    if (editable || !storageKey) return;
    try { setSelected(sessionStorage.getItem(storageKey) || undefined); } catch {}
  }, [editable, storageKey]);

  useEffect(() => {
    if (previous.current === currentId) return;
    previous.current = currentId;
    if (!feedback || editable || matchMedia("(prefers-reduced-motion: reduce)").matches || !panel.current) return;
    const animation = panel.current.animate(
      [{ opacity: 0.65, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" },
    );
    return () => animation.cancel();
  }, [currentId, editable, feedback]);

  function choose(index: number) {
    const next = items[index]?.id;
    if (!next) return;
    setSelected(next);
    if (!editable && storageKey) {
      try { sessionStorage.setItem(storageKey, next); } catch {}
    }
  }

  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number, vertical = false) {
    const previous = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";
    if (![previous, next, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let target = 0;
    if (event.key === "End") target = items.length - 1;
    if (event.key === previous) target = (index - 1 + items.length) % items.length;
    if (event.key === next) target = (index + 1) % items.length;
    choose(target);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[target]?.focus();
  }

  return { id, current, panel, choose, tabKey };
}

function ItemText({ item, index, field, editItem, editable, as, className }: Pick<ExplorerProps, "editItem" | "editable"> & {
  item: ContentItem; index: number; field: "title" | "text" | "label" | "meta"; as: "span" | "p" | "h3"; className?: string;
}) {
  return <EditableText value={item[field]} editable={editable} as={as} className={className}
    onChange={value => editItem(index, field, value)} />;
}

export function WorldExplorer({ storageKey, ...props }: ExplorerProps & { storageKey: string }) {
  const { items, editable, editItem } = props;
  const { id, current, panel, choose, tabKey } = useExplorer(props, storageKey);
  if (!items.length) return null;

  return <div className={styles.worldExplorer}>
    <div className={styles.worldTabs} role={editable ? undefined : "tablist"} aria-label="Leistungen auswählen">
      {items.map((item, index) => {
        const world = worldIndex(item, index);
        return <EditableChoice key={item.id} type="button" editable={editable} role="tab" id={`${id}-tab-${index}`}
          aria-selected={current === index} aria-controls={`${id}-world-${index}`} tabIndex={current === index ? 0 : -1}
          className={styles.worldTab} data-world={world} data-active={current === index} data-item-id={item.id}
          onChoose={() => choose(index)} onKeyDown={event => tabKey(event, index)}>
          <span className={styles.worldDot} aria-hidden="true" />
          <ItemText item={item} index={index} field="title" editItem={editItem} editable={editable} as="span" />
          <ArrowRight className={styles.worldSelectMark} size={16} aria-hidden="true" />
        </EditableChoice>;
      })}
    </div>
    <div className={styles.worldPanels}>
      {items.map((item, index) => {
        const world = worldIndex(item, index);
        const active = current === index;
        return <div key={item.id} id={`${id}-world-${index}`} role={editable ? undefined : "tabpanel"} className={styles.worldPanel}
          data-world={world} data-active={active} aria-labelledby={`${id}-tab-${index}`} aria-hidden={!active || undefined}
          inert={!active} tabIndex={active && !editable ? 0 : undefined} data-item-id={item.id}>
          <div className={styles.worldArt} aria-hidden={item.image?.src ? undefined : true}>
            {item.image?.src ? <EditableImage image={item.image} editable={editable} className={styles.worldImage}
              onChange={value => editItem(index,"image",value)} /> : <><div className={styles.worldPlanet} /><AtlasPlanet world={world} /><span /><span /></>}
          </div>
          <div className={styles.worldCopy} ref={active ? panel : undefined} data-cm-panel="">
            <ItemText item={item} index={index} field="meta" editItem={editItem} editable={editable} as="span" className={styles.eyebrow} />
            <ItemText item={item} index={index} field="label" editItem={editItem} editable={editable} as="h3" />
            <ItemText item={item} index={index} field="text" editItem={editItem} editable={editable} as="p" />
            {Boolean(item.details?.length) && <ul className={styles.tags}>
              {item.details!.map((detail, detailIndex) => <li key={detailIndex}>
                <EditableText value={detail} as="span" editable={editable}
                  onChange={value => editItem(index, "details", item.details!.map((old, position) => position === detailIndex ? value : old))} />
              </li>)}
            </ul>}
            {(item.href || editable) && <ContentLink href={item.href} editable={editable} editField="href" editItemId={item.id}
              className={styles.outlineButton} label={`Mehr über ${item.title} erfahren`}>
              Mehr erfahren <ArrowUpRight size={17} aria-hidden="true" />
            </ContentLink>}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

export function ProcessExplorer(props: ExplorerProps) {
  const { items, editable, editItem } = props;
  const { id, current, panel, choose, tabKey } = useExplorer(props);
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = matchMedia("(min-width: 761px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  if (!items.length) return null;

  const progress = (current + 1) / items.length;
  return <div className={styles.process}>
    <div className={styles.processSteps} role={editable ? undefined : "tablist"} aria-label="Schritte der Zusammenarbeit"
      aria-orientation={editable ? undefined : desktop ? "vertical" : "horizontal"}>
      {items.map((item, index) => <EditableChoice key={item.id} editable={editable} type="button" role="tab" id={`${id}-step-${index}`}
        aria-selected={current === index} aria-controls={`${id}-detail-${index}`} tabIndex={current === index ? 0 : -1}
        className={styles.step} data-active={current === index} data-completed={index < current} data-item-id={item.id}
        onKeyDown={event => tabKey(event, index, desktop)} onChoose={() => choose(index)}>
        <span className={styles.stepNumber} aria-hidden="true">{index < current ? <Check size={15} /> : twoDigits(index + 1)}</span>
        <ItemText item={item} index={index} field="title" editItem={editItem} editable={editable} as="span" className={styles.stepLabel} />
        <ArrowRight className={styles.stepArrow} size={16} aria-hidden="true" />
      </EditableChoice>)}
    </div>
    <div className={styles.processCard}>
      <div className={styles.processProgress} aria-hidden="true"><span style={{ width: `${progress * 100}%` }} /></div>
      <div className={styles.processPanels}>
        {items.map((item,index) => {
          const active = current === index;
          return <div key={item.id} role={editable ? undefined : "tabpanel"} id={`${id}-detail-${index}`} aria-labelledby={`${id}-step-${index}`}
            aria-hidden={!active || undefined} inert={!active} data-active={active} className={styles.processDetail}
            tabIndex={active && !editable ? 0 : undefined} data-item-id={item.id}>
            <div ref={active ? panel : undefined} data-cm-panel="">
              <ItemText item={item} index={index} field="title" editItem={editItem} editable={editable} as="span" className={styles.eyebrow} />
              <ItemText item={item} index={index} field="label" editItem={editItem} editable={editable} as="h3" />
              <ItemText item={item} index={index} field="text" editItem={editItem} editable={editable} as="p" />
            </div>
          </div>;
        })}
      </div>
      <div className={styles.processControls}>
        <span role="status">Schritt {current + 1} von {items.length}</span>
        <div>
          <button type="button" aria-label="Vorheriger Schritt" disabled={current === 0} onClick={() => choose(current - 1)}><ArrowLeft size={20} aria-hidden="true" /></button>
          <button type="button" aria-label="Nächster Schritt" disabled={current === items.length - 1} onClick={() => choose(current + 1)}><ArrowRight size={20} aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  </div>;
}
