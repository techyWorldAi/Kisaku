function d(t,e){const r=e?.trim();return r?r.replace(/^TS(?=[-\s\d]|$)/i,"KSA"):`KSA${String(t).replace(/\D/g,"").slice(-8).padStart(8,"0")}`}export{d as f};
