"use client";

import React from "react";
import { TagSimple } from "@phosphor-icons/react";

export default function TagList({ tags, selectedTags, onToggleTag, tagsRef }) {
  const orderedTags = tags.sort((a, b) =>
    selectedTags.includes(a.name) && !selectedTags.includes(b.name) ? -1 : 1
  );

  return (
    <details className="md" ref={tagsRef}>
      <summary className="icon-label">
        Tags
        <TagSimple />
      </summary>
      <div className="inside">
        {orderedTags.map(({ name, icon }) => (
          <button
            key={name}
            className={selectedTags.includes(name) ? "selected" : ""}
            onClick={() => onToggleTag(name)}
          >
            {icon} {name}
          </button>
        ))}
      </div>
    </details>
  );
}
