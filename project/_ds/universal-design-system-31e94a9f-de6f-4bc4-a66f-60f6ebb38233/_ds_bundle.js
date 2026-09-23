/* @ds-bundle: {"format":4,"namespace":"UniversalDesignSystem_31e94a","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"CommandPalette","sourcePath":"components/command/CommandPalette.jsx"},{"name":"Badge","sourcePath":"components/data/Badge.jsx"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"Tag","sourcePath":"components/data/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"79e2e683ff8d","components/actions/IconButton.jsx":"4198b0361fbe","components/command/CommandPalette.jsx":"26834470f01d","components/data/Badge.jsx":"62071731a757","components/data/Card.jsx":"a6cd42c64c3c","components/data/Tag.jsx":"398f9d460fc3","components/feedback/Dialog.jsx":"9540aa89e865","components/feedback/EmptyState.jsx":"b4f851f109b0","components/feedback/Toast.jsx":"dfff7e2730a7","components/feedback/Tooltip.jsx":"806e804acf20","components/forms/Checkbox.jsx":"35759a711a71","components/forms/Input.jsx":"70bd72562f2b","components/forms/Radio.jsx":"ebcc0f9ac654","components/forms/Select.jsx":"5012a8029a16","components/forms/Switch.jsx":"16dd2e246e67","components/navigation/Tabs.jsx":"65ead8b0125f","ui_kits/ledger/App.jsx":"77d914750175","ui_kits/ledger/Icons.jsx":"82b521bc8ba2","ui_kits/ledger/InvoicesScreen.jsx":"b6532771304e","ui_kits/ledger/LoginScreen.jsx":"1f4b3f460577","ui_kits/ledger/OverviewScreen.jsx":"e6a8d8e2b656","ui_kits/ledger/Shell.jsx":"adb8edd53a3b"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.UniversalDesignSystem_31e94a = window.UniversalDesignSystem_31e94a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-btn{--_h:44px;display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2xs);
  font-family:var(--font-body);font-weight:var(--weight-medium);font-size:var(--text-sm);line-height:1;
  min-height:var(--_h);padding-block:var(--space-2xs);padding-inline:var(--space-s);
  border-radius:var(--radius-md);border:1px solid transparent;cursor:pointer;white-space:nowrap;
  transition:background var(--duration-fast) var(--ease-out),border-color var(--duration-fast) var(--ease-out),transform var(--duration-fast) var(--ease-out);
  -webkit-user-select:none;user-select:none;text-decoration:none}
.ds-btn:active{transform:scale(0.98)}
.ds-btn:disabled,.ds-btn[aria-disabled=true]{opacity:.5;cursor:not-allowed;transform:none}
.ds-btn--sm{--_h:36px;font-size:var(--text-xs);padding-inline:var(--space-xs)}
.ds-btn--lg{--_h:52px;font-size:var(--text-base);padding-inline:var(--space-m)}
.ds-btn--full{width:100%}
.ds-btn--primary{background:var(--color-accent);color:var(--color-on-accent)}
.ds-btn--primary:hover:not(:disabled){background:var(--color-accent-hover)}
.ds-btn--secondary{background:var(--color-surface);color:var(--color-text);border-color:var(--color-border)}
.ds-btn--secondary:hover:not(:disabled){background:var(--color-surface-2)}
.ds-btn--ghost{background:transparent;color:var(--color-text)}
.ds-btn--ghost:hover:not(:disabled){background:var(--color-surface-2)}
.ds-btn--danger{background:var(--color-danger);color:#fff}
.ds-btn--danger:hover:not(:disabled){background:color-mix(in oklch,var(--color-danger),black 8%)}
.ds-btn__spin{width:1em;height:1em;border-radius:50%;border:2px solid currentColor;border-top-color:transparent;animation:ds-btn-spin .6s linear infinite}
@keyframes ds-btn-spin{to{transform:rotate(360deg)}}
.ds-btn__ico{display:inline-flex;width:1.15em;height:1.15em}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-btn-css')) {
  const s = document.createElement('style');
  s.id = 'ds-btn-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/**
 * Primary action control. One primary button per screen; everything else
 * secondary/ghost. Labels are outcome verbs ("Save changes"), never "Submit".
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  iconStart,
  iconEnd,
  disabled,
  className = '',
  children,
  ...rest
}) {
  const cls = ['ds-btn', `ds-btn--${variant}`, size !== 'md' && `ds-btn--${size}`, fullWidth && 'ds-btn--full', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    disabled: disabled || loading,
    "aria-busy": loading || undefined
  }, rest), loading ? /*#__PURE__*/React.createElement("span", {
    className: "ds-btn__spin",
    "aria-hidden": "true"
  }) : iconStart && /*#__PURE__*/React.createElement("span", {
    className: "ds-btn__ico",
    "aria-hidden": "true"
  }, iconStart), children, !loading && iconEnd && /*#__PURE__*/React.createElement("span", {
    className: "ds-btn__ico",
    "aria-hidden": "true"
  }, iconEnd));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-iconbtn{display:inline-flex;align-items:center;justify-content:center;
  width:44px;height:44px;border-radius:var(--radius-md);border:1px solid transparent;
  background:transparent;color:var(--color-text-muted);cursor:pointer;
  transition:background var(--duration-fast) var(--ease-out),color var(--duration-fast) var(--ease-out),transform var(--duration-fast) var(--ease-out)}
.ds-iconbtn:hover:not(:disabled){background:var(--color-surface-2);color:var(--color-text)}
.ds-iconbtn:active{transform:scale(0.94)}
.ds-iconbtn:disabled{opacity:.45;cursor:not-allowed}
.ds-iconbtn--sm{width:36px;height:36px}
.ds-iconbtn--solid{background:var(--color-accent);color:var(--color-on-accent)}
.ds-iconbtn--solid:hover:not(:disabled){background:var(--color-accent-hover);color:var(--color-on-accent)}
.ds-iconbtn--outline{border-color:var(--color-border);color:var(--color-text)}
.ds-iconbtn__ico{display:inline-flex;width:20px;height:20px}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-iconbtn-css')) {
  const s = document.createElement('style');
  s.id = 'ds-iconbtn-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Square 44px control for a single icon action. Requires an accessible label. */
function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  icon,
  className = '',
  ...rest
}) {
  const cls = ['ds-iconbtn', variant !== 'ghost' && `ds-iconbtn--${variant}`, size === 'sm' && 'ds-iconbtn--sm', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    "aria-label": label,
    title: label
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "ds-iconbtn__ico",
    "aria-hidden": "true"
  }, icon));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/command/CommandPalette.jsx
try { (() => {
const css = `
.ds-cmdk__scrim{position:fixed;inset:0;background:color-mix(in oklch,var(--color-text) 45%,transparent);
  display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;padding-inline:var(--space-s);z-index:1100;
  animation:ds-cmdk-fade var(--duration-base) var(--ease-out)}
.ds-cmdk{width:min(100%,560px);background:var(--color-surface);border:1px solid var(--color-border);
  border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);overflow:hidden;font-family:var(--font-body);color:var(--color-text);
  animation:ds-cmdk-pop var(--duration-slow) var(--ease-out)}
.ds-cmdk__search{display:flex;align-items:center;gap:var(--space-2xs);padding:var(--space-xs) var(--space-s);border-bottom:1px solid var(--color-border)}
.ds-cmdk__search svg{width:18px;height:18px;color:var(--color-text-faint);flex:none}
.ds-cmdk__input{flex:1;border:0;outline:none;background:transparent;font-family:inherit;font-size:var(--text-base);color:var(--color-text)}
.ds-cmdk__input::placeholder{color:var(--color-text-faint)}
.ds-cmdk__list{max-height:min(52vh,380px);overflow:auto;padding:var(--space-3xs)}
.ds-cmdk__group{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--color-text-faint);
  padding:var(--space-2xs) var(--space-2xs) var(--space-3xs);text-transform:uppercase;letter-spacing:var(--tracking-wide)}
.ds-cmdk__item{display:flex;align-items:center;gap:var(--space-2xs);width:100%;text-align:left;border:0;background:transparent;
  cursor:pointer;font-family:inherit;font-size:var(--text-sm);color:var(--color-text);
  padding:var(--space-2xs) var(--space-2xs);border-radius:var(--radius-sm)}
.ds-cmdk__item svg{width:16px;height:16px;color:var(--color-text-muted);flex:none}
.ds-cmdk__item[aria-selected=true]{background:var(--color-accent-subtle)}
.ds-cmdk__item[aria-selected=true],.ds-cmdk__item[aria-selected=true] svg{color:var(--color-accent)}
.ds-cmdk__kbd{margin-inline-start:auto;font-family:var(--font-mono);font-size:11px;color:var(--color-text-faint)}
.ds-cmdk__empty{padding:var(--space-m);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm)}
.ds-cmdk__foot{display:flex;gap:var(--space-s);padding:var(--space-2xs) var(--space-s);border-top:1px solid var(--color-border);
  font-size:var(--text-xs);color:var(--color-text-faint)}
@keyframes ds-cmdk-fade{from{opacity:0}to{opacity:1}}
@keyframes ds-cmdk-pop{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-cmdk-css')) {
  const s = document.createElement('style');
  s.id = 'ds-cmdk-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Cmd/Ctrl+K palette: fuzzy search over actions + navigation, fully keyboard-navigable. */
function CommandPalette({
  open,
  onClose,
  commands = [],
  placeholder = 'Search actions…'
}) {
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
    }
  }, [open]);
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter(c => (c.label + ' ' + (c.group || '') + ' ' + (c.keywords || '')).toLowerCase().includes(s));
  }, [q, commands]);
  React.useEffect(() => {
    setActive(0);
  }, [q]);
  if (!open) return null;
  const run = c => {
    c && c.onRun && c.onRun();
    onClose && onClose();
  };
  const onKey = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(filtered[active]);
    } else if (e.key === 'Escape') {
      onClose && onClose();
    }
  };
  let idx = -1;
  const groups = [];
  filtered.forEach(c => {
    const g = c.group || 'Commands';
    let bucket = groups.find(x => x.name === g);
    if (!bucket) {
      bucket = {
        name: g,
        items: []
      };
      groups.push(bucket);
    }
    bucket.items.push(c);
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-cmdk__scrim",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose && onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-cmdk",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Command palette",
    onKeyDown: onKey
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-cmdk__search"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 18 18",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "5.5",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12.5 12.5L16 16",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    className: "ds-cmdk__input",
    placeholder: placeholder,
    value: q,
    onChange: e => setQ(e.target.value),
    role: "combobox",
    "aria-expanded": "true",
    "aria-controls": "ds-cmdk-list",
    "aria-activedescendant": `ds-cmdk-opt-${active}`
  })), /*#__PURE__*/React.createElement("div", {
    className: "ds-cmdk__list",
    id: "ds-cmdk-list",
    role: "listbox"
  }, filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "ds-cmdk__empty"
  }, "No results for \u201C", q, "\u201D"), groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-cmdk__group"
  }, g.name), g.items.map(c => {
    idx += 1;
    const i = idx;
    const selected = i === active;
    return /*#__PURE__*/React.createElement("button", {
      key: c.id || c.label,
      id: `ds-cmdk-opt-${i}`,
      role: "option",
      "aria-selected": selected,
      className: "ds-cmdk__item",
      onMouseEnter: () => setActive(i),
      onClick: () => run(c)
    }, c.icon && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, c.icon), /*#__PURE__*/React.createElement("span", null, c.label), c.shortcut && /*#__PURE__*/React.createElement("span", {
      className: "ds-cmdk__kbd"
    }, c.shortcut));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ds-cmdk__foot"
  }, /*#__PURE__*/React.createElement("span", null, "\u2191\u2193 navigate"), /*#__PURE__*/React.createElement("span", null, "\u21B5 select"), /*#__PURE__*/React.createElement("span", null, "esc close"))));
}
Object.assign(__ds_scope, { CommandPalette });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/command/CommandPalette.jsx", error: String((e && e.message) || e) }); }

// components/data/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-badge{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-body);font-size:var(--text-xs);
  font-weight:var(--weight-medium);line-height:1;padding:4px 8px;border-radius:var(--radius-full);
  background:var(--color-surface-2);color:var(--color-text-muted);border:1px solid transparent;white-space:nowrap}
.ds-badge__dot{width:6px;height:6px;border-radius:var(--radius-full);background:currentColor;flex:none}
.ds-badge--neutral{background:var(--color-surface-2);color:var(--color-text-muted)}
.ds-badge--accent{background:var(--color-accent-subtle);color:var(--color-accent)}
.ds-badge--success{background:var(--color-success-subtle);color:var(--color-success)}
.ds-badge--warning{background:var(--color-warning-subtle);color:color-mix(in oklch,var(--color-warning),black 22%)}
.ds-badge--danger{background:var(--color-danger-subtle);color:var(--color-danger)}
.ds-badge--info{background:var(--color-info-subtle);color:var(--color-info)}
[data-theme=dark] .ds-badge--warning{color:var(--color-warning)}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-badge-css')) {
  const s = document.createElement('style');
  s.id = 'ds-badge-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Status pill. Color always paired with a label (and optional dot). */
function Badge({
  tone = 'neutral',
  dot = false,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `ds-badge ds-badge--${tone} ${className}`
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "ds-badge__dot",
    "aria-hidden": "true"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);
  box-shadow:var(--shadow-sm);color:var(--color-text);font-family:var(--font-body)}
.ds-card--pad{padding:var(--space-s)}
.ds-card--interactive{cursor:pointer;transition:box-shadow var(--duration-base) var(--ease-out),transform var(--duration-base) var(--ease-out),border-color var(--duration-base) var(--ease-out)}
.ds-card--interactive:hover{box-shadow:var(--shadow-md);border-color:color-mix(in oklch,var(--color-border),var(--color-text) 15%)}
.ds-card--interactive:active{transform:translateY(1px)}
.ds-card__header{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-s);padding:var(--space-s) var(--space-s) 0}
.ds-card__title{font-size:var(--text-lg);font-weight:var(--weight-semibold);line-height:var(--leading-snug)}
.ds-card__desc{font-size:var(--text-sm);color:var(--color-text-muted);margin-top:2px}
.ds-card__body{padding:var(--space-s)}
.ds-card__footer{display:flex;align-items:center;gap:var(--space-2xs);padding:0 var(--space-s) var(--space-s);
  border-top:1px solid var(--color-border);padding-top:var(--space-s);margin-top:var(--space-s)}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-card-css')) {
  const s = document.createElement('style');
  s.id = 'ds-card-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Surface container. Composable via Card.Header / Body / Footer, or pass children with `padded`. */
function Card({
  interactive = false,
  padded = false,
  className = '',
  children,
  ...rest
}) {
  const cls = ['ds-card', padded && 'ds-card--pad', interactive && 'ds-card--interactive', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), children);
}
Card.Header = function CardHeader({
  title,
  description,
  action,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-card__header"
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("div", {
    className: "ds-card__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "ds-card__desc"
  }, description), children), action);
};
Card.Body = function CardBody({
  className = '',
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `ds-card__body ${className}`
  }, children);
};
Card.Footer = function CardFooter({
  className = '',
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `ds-card__footer ${className}`
  }, children);
};
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-tag{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-body);font-size:var(--text-xs);
  font-weight:var(--weight-medium);line-height:1;padding:5px 6px 5px 10px;border-radius:var(--radius-sm);
  background:var(--color-surface-2);color:var(--color-text);border:1px solid var(--color-border)}
.ds-tag--plain{padding-inline-end:10px}
.ds-tag__x{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;
  border:0;background:transparent;color:var(--color-text-faint);cursor:pointer;padding:0;
  transition:background var(--duration-fast) var(--ease-out),color var(--duration-fast) var(--ease-out)}
.ds-tag__x:hover{background:var(--color-border);color:var(--color-text)}
.ds-tag__x svg{width:12px;height:12px}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-tag-css')) {
  const s = document.createElement('style');
  s.id = 'ds-tag-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** User-managed label / filter chip. Removable when `onRemove` is provided. */
function Tag({
  onRemove,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `ds-tag${onRemove ? '' : ' ds-tag--plain'} ${className}`
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ds-tag__x",
    "aria-label": "Remove",
    onClick: onRemove
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 12 12",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3l6 6M9 3l-6 6",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
const css = `
.ds-dialog__scrim{position:fixed;inset:0;background:color-mix(in oklch,var(--color-text) 55%,transparent);
  display:flex;align-items:center;justify-content:center;padding:var(--space-s);z-index:1000;
  animation:ds-dialog-fade var(--duration-base) var(--ease-out)}
.ds-dialog{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);
  box-shadow:var(--shadow-lg);width:min(100%,460px);max-height:90dvh;overflow:auto;font-family:var(--font-body);color:var(--color-text);
  animation:ds-dialog-pop var(--duration-slow) var(--ease-out)}
.ds-dialog__head{padding:var(--space-m) var(--space-m) 0}
.ds-dialog__title{font-size:var(--text-xl);font-weight:var(--weight-semibold);line-height:var(--leading-snug)}
.ds-dialog__desc{font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-3xs)}
.ds-dialog__body{padding:var(--space-s) var(--space-m)}
.ds-dialog__foot{display:flex;justify-content:flex-end;gap:var(--space-2xs);padding:0 var(--space-m) var(--space-m);flex-wrap:wrap}
@keyframes ds-dialog-fade{from{opacity:0}to{opacity:1}}
@keyframes ds-dialog-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-dialog-css')) {
  const s = document.createElement('style');
  s.id = 'ds-dialog-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Modal dialog. Renders nothing when `open` is false. Esc / scrim click closes. */
function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  children
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose && onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.activeElement;
    ref.current && ref.current.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      prev && prev.focus && prev.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-dialog__scrim",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose && onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-dialog",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === 'string' ? title : undefined,
    tabIndex: -1,
    ref: ref
  }, (title || description) && /*#__PURE__*/React.createElement("div", {
    className: "ds-dialog__head"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "ds-dialog__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "ds-dialog__desc"
  }, description)), children && /*#__PURE__*/React.createElement("div", {
    className: "ds-dialog__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "ds-dialog__foot"
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
const css = `
.ds-empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:var(--space-2xs);
  padding:var(--space-xl) var(--space-s);font-family:var(--font-body);color:var(--color-text);max-width:42ch;margin-inline:auto}
.ds-empty__ico{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;
  border-radius:var(--radius-full);background:var(--color-accent-subtle);color:var(--color-accent);margin-bottom:var(--space-2xs)}
.ds-empty__ico svg{width:24px;height:24px}
.ds-empty__title{font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.ds-empty__desc{font-size:var(--text-sm);color:var(--color-text-muted)}
.ds-empty__action{margin-top:var(--space-xs)}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-empty-css')) {
  const s = document.createElement('style');
  s.id = 'ds-empty-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Empty state: one human-voiced sentence + one primary action. Never blank. */
function EmptyState({
  icon,
  title,
  description,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-empty"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "ds-empty__ico",
    "aria-hidden": "true"
  }, icon), title && /*#__PURE__*/React.createElement("div", {
    className: "ds-empty__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "ds-empty__desc"
  }, description), action && /*#__PURE__*/React.createElement("div", {
    className: "ds-empty__action"
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const css = `
.ds-toast{display:flex;align-items:flex-start;gap:var(--space-2xs);width:min(100%,380px);
  background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);
  box-shadow:var(--shadow-md);padding:var(--space-xs) var(--space-s);font-family:var(--font-body);color:var(--color-text);
  animation:ds-toast-in var(--duration-base) var(--ease-out)}
.ds-toast__ico{display:inline-flex;width:18px;height:18px;flex:none;margin-top:1px}
.ds-toast--success .ds-toast__ico{color:var(--color-success)}
.ds-toast--danger .ds-toast__ico{color:var(--color-danger)}
.ds-toast--info .ds-toast__ico{color:var(--color-info)}
.ds-toast__body{flex:1;min-width:0}
.ds-toast__title{font-size:var(--text-sm);font-weight:var(--weight-medium)}
.ds-toast__desc{font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px}
.ds-toast__x{border:0;background:transparent;color:var(--color-text-faint);cursor:pointer;padding:2px;border-radius:4px;line-height:0}
.ds-toast__x:hover{color:var(--color-text);background:var(--color-surface-2)}
.ds-toast__x svg{width:14px;height:14px}
@keyframes ds-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-toast-css')) {
  const s = document.createElement('style');
  s.id = 'ds-toast-css';
  s.textContent = css;
  document.head.appendChild(s);
}
const icons = {
  success: 'M4 8.5l2.5 2.5L12 5',
  danger: 'M8 4.5v4.5M8 11.5h.01',
  info: 'M8 7.5v4M8 4.5h.01'
};

/** Transient confirmation. Render inside a bottom-right/bottom-center region; auto-dismiss ~4s. */
function Toast({
  tone = 'info',
  title,
  description,
  onDismiss
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `ds-toast ds-toast--${tone}`,
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ds-toast__ico",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "7",
    stroke: "currentColor",
    strokeWidth: "1.3",
    opacity: ".35"
  }), /*#__PURE__*/React.createElement("path", {
    d: icons[tone] || icons.info,
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ds-toast__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "ds-toast__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "ds-toast__desc"
  }, description)), onDismiss && /*#__PURE__*/React.createElement("button", {
    className: "ds-toast__x",
    "aria-label": "Dismiss",
    onClick: onDismiss
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 14 14",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 3.5l7 7M10.5 3.5l-7 7",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
const css = `
.ds-tt{position:relative;display:inline-flex}
.ds-tt__pop{position:absolute;z-index:50;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);
  background:var(--color-text);color:var(--color-bg);font-family:var(--font-body);font-size:var(--text-xs);
  font-weight:var(--weight-medium);line-height:1.3;padding:6px 9px;border-radius:var(--radius-sm);white-space:nowrap;
  box-shadow:var(--shadow-md);opacity:0;pointer-events:none;
  transition:opacity var(--duration-fast) var(--ease-out),transform var(--duration-fast) var(--ease-out)}
.ds-tt:hover .ds-tt__pop,.ds-tt:focus-within .ds-tt__pop{opacity:1;transform:translateX(-50%) translateY(0)}
.ds-tt__pop::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);
  border:5px solid transparent;border-top-color:var(--color-text)}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-tt-css')) {
  const s = document.createElement('style');
  s.id = 'ds-tt-css';
  s.textContent = css;
  document.head.appendChild(s);
}
let _uid = 0;

/** Hover/focus tooltip. Wraps a single focusable child; label appears above. */
function Tooltip({
  label,
  children
}) {
  const id = React.useRef(`ds-tt-${++_uid}`).current;
  const child = React.Children.only(children);
  return /*#__PURE__*/React.createElement("span", {
    className: "ds-tt"
  }, React.cloneElement(child, {
    'aria-describedby': id
  }), /*#__PURE__*/React.createElement("span", {
    className: "ds-tt__pop",
    role: "tooltip",
    id: id
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-check{display:inline-flex;align-items:flex-start;gap:var(--space-2xs);cursor:pointer;font-family:var(--font-body);
  font-size:var(--text-sm);color:var(--color-text);min-height:44px;align-items:center}
.ds-check input{position:absolute;opacity:0;width:0;height:0}
.ds-check__box{display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:20px;height:20px;border:1.5px solid var(--color-border);border-radius:6px;background:var(--color-surface);
  transition:background var(--duration-fast) var(--ease-out),border-color var(--duration-fast) var(--ease-out)}
.ds-check:hover .ds-check__box{border-color:var(--color-accent)}
.ds-check input:checked + .ds-check__box{background:var(--color-accent);border-color:var(--color-accent)}
.ds-check input:focus-visible + .ds-check__box{outline:2px solid var(--color-accent);outline-offset:2px}
.ds-check input:disabled + .ds-check__box{opacity:.5}
.ds-check__box svg{width:14px;height:14px;color:var(--color-on-accent);opacity:0;transform:scale(.6);transition:opacity var(--duration-fast) var(--ease-out),transform var(--duration-fast) var(--ease-out)}
.ds-check input:checked + .ds-check__box svg{opacity:1;transform:scale(1)}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-check-css')) {
  const s = document.createElement('style');
  s.id = 'ds-check-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Checkbox with label. Controlled via `checked` or uncontrolled via `defaultChecked`. */
function Checkbox({
  label,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `ds-check ${className}`
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "ds-check__box",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.5l3 3 6-7",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-field{display:flex;flex-direction:column;gap:var(--space-3xs);font-family:var(--font-body)}
.ds-field__label{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--color-text)}
.ds-field__req{color:var(--color-danger);margin-inline-start:2px}
.ds-field__wrap{position:relative;display:flex;align-items:center}
.ds-field__ico{position:absolute;inset-inline-start:12px;display:inline-flex;width:18px;height:18px;color:var(--color-text-faint);pointer-events:none}
.ds-input{width:100%;min-height:44px;font-family:inherit;font-size:16px;color:var(--color-text);
  background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);
  padding-block:var(--space-2xs);padding-inline:var(--space-xs);
  transition:border-color var(--duration-fast) var(--ease-out),box-shadow var(--duration-fast) var(--ease-out)}
.ds-field__wrap--ico .ds-input{padding-inline-start:38px}
.ds-input::placeholder{color:var(--color-text-faint)}
.ds-input:hover:not(:disabled){border-color:color-mix(in oklch,var(--color-border),var(--color-text) 25%)}
.ds-input:focus{outline:none;border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-subtle)}
.ds-input:disabled{background:var(--color-surface-2);color:var(--color-text-muted);cursor:not-allowed}
.ds-input--error{border-color:var(--color-danger)}
.ds-input--error:focus{box-shadow:0 0 0 3px var(--color-danger-subtle)}
.ds-field__msg{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);margin-top:2px}
.ds-field__msg--error{color:var(--color-danger)}
.ds-field__msg--hint{color:var(--color-text-muted)}
@media (min-width:640px){.ds-input{font-size:var(--text-sm)}}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-input-css')) {
  const s = document.createElement('style');
  s.id = 'ds-input-css';
  s.textContent = css;
  document.head.appendChild(s);
}
let _uid = 0;

/** Labeled text input. Label always visible above the field (no placeholder-as-label). */
function Input({
  label,
  hint,
  error,
  required,
  icon,
  id,
  className = '',
  ...rest
}) {
  const fid = id || `ds-input-${++_uid}`;
  const msgId = `${fid}-msg`;
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "ds-field__label",
    htmlFor: fid
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "ds-field__req",
    "aria-hidden": "true"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: `ds-field__wrap${icon ? ' ds-field__wrap--ico' : ''}`
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "ds-field__ico",
    "aria-hidden": "true"
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    className: `ds-input${error ? ' ds-input--error' : ''} ${className}`,
    "aria-invalid": !!error,
    "aria-describedby": error || hint ? msgId : undefined
  }, rest))), error ? /*#__PURE__*/React.createElement("span", {
    id: msgId,
    className: "ds-field__msg ds-field__msg--error"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    id: msgId,
    className: "ds-field__msg ds-field__msg--hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-radiogroup{display:flex;flex-direction:column;gap:var(--space-3xs)}
.ds-radio{display:inline-flex;align-items:center;gap:var(--space-2xs);cursor:pointer;font-family:var(--font-body);
  font-size:var(--text-sm);color:var(--color-text);min-height:44px}
.ds-radio input{position:absolute;opacity:0;width:0;height:0}
.ds-radio__dot{display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:20px;height:20px;border:1.5px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-surface);
  transition:border-color var(--duration-fast) var(--ease-out)}
.ds-radio:hover .ds-radio__dot{border-color:var(--color-accent)}
.ds-radio__dot::after{content:"";width:10px;height:10px;border-radius:var(--radius-full);background:var(--color-accent);
  transform:scale(0);transition:transform var(--duration-fast) var(--ease-out)}
.ds-radio input:checked + .ds-radio__dot{border-color:var(--color-accent)}
.ds-radio input:checked + .ds-radio__dot::after{transform:scale(1)}
.ds-radio input:focus-visible + .ds-radio__dot{outline:2px solid var(--color-accent);outline-offset:2px}
.ds-radio input:disabled + .ds-radio__dot{opacity:.5}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-radio-css')) {
  const s = document.createElement('style');
  s.id = 'ds-radio-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Single radio. Compose several with the same `name`, or use RadioGroup. */
function Radio({
  label,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `ds-radio ${className}`
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "ds-radio__dot",
    "aria-hidden": "true"
  }), label && /*#__PURE__*/React.createElement("span", null, label));
}

/** Vertical group of radios sharing a name. */
function RadioGroup({
  name,
  value,
  onChange,
  options = []
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-radiogroup",
    role: "radiogroup"
  }, options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement(Radio, {
      key: opt.value,
      name: name,
      value: opt.value,
      label: opt.label,
      checked: value === opt.value,
      onChange: () => onChange && onChange(opt.value)
    });
  }));
}
Object.assign(__ds_scope, { Radio, RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-select__wrap{position:relative;display:flex;align-items:center}
.ds-select{width:100%;min-height:44px;font-family:var(--font-body);font-size:16px;color:var(--color-text);
  background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);
  padding-block:var(--space-2xs);padding-inline:var(--space-xs);padding-inline-end:38px;cursor:pointer;
  appearance:none;-webkit-appearance:none;
  transition:border-color var(--duration-fast) var(--ease-out),box-shadow var(--duration-fast) var(--ease-out)}
.ds-select:hover:not(:disabled){border-color:color-mix(in oklch,var(--color-border),var(--color-text) 25%)}
.ds-select:focus{outline:none;border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-subtle)}
.ds-select:disabled{background:var(--color-surface-2);color:var(--color-text-muted);cursor:not-allowed}
.ds-select__caret{position:absolute;inset-inline-end:12px;width:16px;height:16px;color:var(--color-text-muted);pointer-events:none}
@media (min-width:640px){.ds-select{font-size:var(--text-sm)}}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-select-css')) {
  const s = document.createElement('style');
  s.id = 'ds-select-css';
  s.textContent = css;
  document.head.appendChild(s);
}
let _uid = 0;

/** Native select styled to match the system. Wrap with a label via `label`. */
function Select({
  label,
  options = [],
  id,
  className = '',
  children,
  ...rest
}) {
  const fid = id || `ds-select-${++_uid}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "ds-field__label",
    htmlFor: fid
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "ds-select__wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    className: `ds-select ${className}`
  }, rest), children || options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("svg", {
    className: "ds-select__caret",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6l4 4 4-4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.ds-switch{display:inline-flex;align-items:center;gap:var(--space-2xs);cursor:pointer;font-family:var(--font-body);
  font-size:var(--text-sm);color:var(--color-text);min-height:44px}
.ds-switch input{position:absolute;opacity:0;width:0;height:0}
.ds-switch__track{position:relative;flex:none;width:40px;height:24px;border-radius:var(--radius-full);
  background:var(--color-border);transition:background var(--duration-base) var(--ease-out)}
.ds-switch__thumb{position:absolute;top:2px;inset-inline-start:2px;width:20px;height:20px;border-radius:var(--radius-full);
  background:#fff;box-shadow:var(--shadow-sm);transition:transform var(--duration-base) var(--ease-out)}
.ds-switch input:checked + .ds-switch__track{background:var(--color-accent)}
.ds-switch input:checked + .ds-switch__track .ds-switch__thumb{transform:translateX(16px)}
.ds-switch input:focus-visible + .ds-switch__track{outline:2px solid var(--color-accent);outline-offset:2px}
.ds-switch input:disabled + .ds-switch__track{opacity:.5}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-switch-css')) {
  const s = document.createElement('style');
  s.id = 'ds-switch-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** On/off toggle for immediate settings (no save button). */
function Switch({
  label,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `ds-switch ${className}`
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "ds-switch__track",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ds-switch__thumb"
  })), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
const css = `
.ds-tabs{font-family:var(--font-body)}
.ds-tabs__list{display:flex;gap:2px;border-bottom:1px solid var(--color-border)}
.ds-tab{position:relative;appearance:none;background:transparent;border:0;cursor:pointer;
  font-family:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--color-text-muted);
  padding:var(--space-2xs) var(--space-xs);min-height:44px;
  transition:color var(--duration-fast) var(--ease-out)}
.ds-tab:hover{color:var(--color-text)}
.ds-tab[aria-selected=true]{color:var(--color-text)}
.ds-tab__ink{position:absolute;left:var(--space-xs);right:var(--space-xs);bottom:-1px;height:2px;border-radius:2px 2px 0 0;
  background:var(--color-accent);transform:scaleX(0);transition:transform var(--duration-base) var(--ease-out)}
.ds-tab[aria-selected=true] .ds-tab__ink{transform:scaleX(1)}
.ds-tab__count{margin-inline-start:6px;font-family:var(--font-mono);font-size:11px;color:var(--color-text-faint);font-variant-numeric:tabular-nums}
`;
if (typeof document !== 'undefined' && !document.getElementById('ds-tabs-css')) {
  const s = document.createElement('style');
  s.id = 'ds-tabs-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/** Underline tab bar. Controlled via `value` + `onChange`. */
function Tabs({
  tabs = [],
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-tabs__list",
    role: "tablist"
  }, tabs.map(t => {
    const tab = typeof t === 'string' ? {
      value: t,
      label: t
    } : t;
    const selected = value === tab.value;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.value,
      role: "tab",
      "aria-selected": selected,
      className: "ds-tab",
      onClick: () => onChange && onChange(tab.value)
    }, tab.label, tab.count != null && /*#__PURE__*/React.createElement("span", {
      className: "ds-tab__count"
    }, tab.count), /*#__PURE__*/React.createElement("span", {
      className: "ds-tab__ink",
      "aria-hidden": "true"
    }));
  })));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ledger/App.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Ledger app root — auth gate, routing, command palette, create flow, theme toggle.
const NS = window.UniversalDesignSystem_31e94a;
const {
  CommandPalette,
  Dialog,
  Toast,
  Input,
  Select,
  Button,
  IconButton
} = NS;
const Icon = window.Icon;
const TITLES = {
  home: 'Overview',
  invoices: 'Invoices',
  clients: 'Clients',
  reports: 'Reports',
  settings: 'Settings'
};
function CreateInvoiceDialog({
  open,
  onClose,
  onCreated
}) {
  const [busy, setBusy] = React.useState(false);
  const create = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onCreated();
    }, 550);
  };
  return /*#__PURE__*/React.createElement(Dialog, {
    open: open,
    onClose: busy ? undefined : onClose,
    title: "Create invoice",
    description: "Draft a new invoice \u2014 you can review before sending.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose,
      disabled: busy
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      onClick: create,
      loading: busy
    }, "Create draft"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-form"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Client",
    options: ['Acme Corp', 'Vantage Labs', 'Northwind Studio', 'Meridian Health']
  }), /*#__PURE__*/React.createElement("div", {
    className: "lg-form__two"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Amount",
    defaultValue: "$0.00"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Due date",
    defaultValue: "2026-08-01"
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Reference",
    placeholder: "e.g. Retainer \u2014 July"
  })));
}
function App() {
  const [authed, setAuthed] = React.useState(false);
  const [route, setRoute] = React.useState('home');
  const [cmd, setCmd] = React.useState(false);
  const [create, setCreate] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);
  React.useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmd(o => !o);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  const fireToast = msg => setToast(msg);
  const onCreated = () => {
    setCreate(false);
    setRoute('invoices');
    fireToast({
      tone: 'success',
      title: 'Draft created',
      description: 'INV-2026-0418 is ready to review.'
    });
  };
  if (!authed) return /*#__PURE__*/React.createElement(window.LoginScreen, {
    onSignIn: () => setAuthed(true)
  });
  const commands = [{
    group: 'Actions',
    label: 'Create invoice',
    shortcut: '⌘N',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16
    }),
    onRun: () => setCreate(true)
  }, {
    group: 'Actions',
    label: 'Record a payment',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "card",
      size: 16
    }),
    onRun: () => fireToast({
      tone: 'info',
      title: 'Record a payment',
      description: 'Payment flow would open here.'
    })
  }, {
    group: 'Actions',
    label: 'Export ledger to CSV',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 16
    }),
    onRun: () => fireToast({
      tone: 'success',
      title: 'Export started',
      description: 'Your CSV will download shortly.'
    })
  }, {
    group: 'Go to',
    label: 'Overview',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "home",
      size: 16
    }),
    onRun: () => setRoute('home')
  }, {
    group: 'Go to',
    label: 'Invoices',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "invoice",
      size: 16
    }),
    onRun: () => setRoute('invoices')
  }, {
    group: 'Go to',
    label: 'Clients',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "clients",
      size: 16
    }),
    onRun: () => setRoute('clients')
  }, {
    group: 'Go to',
    label: 'Settings',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "settings",
      size: 16
    }),
    onRun: () => setRoute('settings')
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "lg-app"
  }, /*#__PURE__*/React.createElement(window.Sidebar, {
    route: route,
    setRoute: setRoute
  }), /*#__PURE__*/React.createElement("main", {
    className: "lg-main"
  }, /*#__PURE__*/React.createElement(window.TopBar, {
    title: TITLES[route],
    onSearch: () => setCmd(true),
    onCreate: () => setCreate(true)
  }), /*#__PURE__*/React.createElement("div", {
    className: "lg-scroll"
  }, route === 'home' && /*#__PURE__*/React.createElement(window.OverviewScreen, null), route === 'invoices' && /*#__PURE__*/React.createElement(window.InvoicesScreen, {
    onOpen: r => fireToast({
      tone: 'info',
      title: r.id,
      description: `Opening ${r.client} — ${window.money(r.amount)}.`
    })
  }), !['home', 'invoices'].includes(route) && /*#__PURE__*/React.createElement("div", {
    className: "lg-page"
  }, /*#__PURE__*/React.createElement(window.KitEmpty, {
    route: route
  })))), /*#__PURE__*/React.createElement("button", {
    className: "lg-theme",
    onClick: () => setDark(d => !d),
    "aria-label": "Toggle theme"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: dark ? 'home' : 'settings',
    size: 16
  }), dark ? 'Light' : 'Dark'), /*#__PURE__*/React.createElement(CommandPalette, {
    open: cmd,
    onClose: () => setCmd(false),
    commands: commands
  }), /*#__PURE__*/React.createElement(CreateInvoiceDialog, {
    open: create,
    onClose: () => setCreate(false),
    onCreated: onCreated
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "lg-toasts"
  }, /*#__PURE__*/React.createElement(Toast, _extends({}, toast, {
    onDismiss: () => setToast(null)
  }))));
}
function KitEmpty({
  route
}) {
  const {
    EmptyState,
    Button
  } = NS;
  return /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: route === 'clients' ? 'clients' : route === 'reports' ? 'reports' : 'settings',
      size: 24
    }),
    title: `${TITLES[route]} is a stub`,
    description: "This UI kit focuses on Overview and Invoices. Wire this screen up the same way.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Back to Overview")
  });
}
window.KitEmpty = KitEmpty;
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ledger/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ledger/Icons.jsx
try { (() => {
// Generic UI glyphs (lucide-style stroke icons) for the Ledger UI kit.
function Icon({
  name,
  size = 20,
  stroke = 1.6
}) {
  const p = Icon.paths[name] || '';
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    style: {
      display: 'block',
      flex: 'none'
    }
  }, p.split('|').map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
}
Icon.paths = {
  invoice: 'M6 3h9l3 3v15H6z|M15 3v3h3|M9 12h6|M9 16h6|M9 8h2',
  clients: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z|M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6|M16 3.5a3.5 3.5 0 010 7|M21 20c0-2.6-1.7-4.8-4-5.7',
  reports: 'M5 21V9|M12 21V4|M19 21v-8',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z|M19 12a7 7 0 00-.1-1.3l2-1.6-2-3.4-2.4 1a7 7 0 00-2.2-1.3L14 2h-4l-.3 2.4a7 7 0 00-2.2 1.3l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .9.1 1.3l-2 1.6 2 3.4 2.4-1a7 7 0 002.2 1.3L10 22h4l.3-2.4a7 7 0 002.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z',
  home: 'M4 11l8-7 8 7|M6 10v9h12v-9',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14z|M16 16l4 4',
  plus: 'M12 5v14|M5 12h14',
  bell: 'M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z|M10 21a2 2 0 004 0',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  filter: 'M4 5h16|M7 12h10|M10 19h4',
  download: 'M12 3v12|M8 11l4 4 4-4|M4 21h16',
  more: 'M5 12h.01|M12 12h.01|M19 12h.01',
  check: 'M5 13l4 4L19 7',
  arrowUp: 'M12 19V5|M6 11l6-6 6 6',
  send: 'M22 3L11 14|M22 3l-7 19-4-8-8-4z',
  logout: 'M15 4h4v16h-4|M10 12h9|M13 8l-3 4 3 4',
  card: 'M3 7h18v11H3z|M3 11h18',
  mail: 'M3 6h18v12H3z|M3 7l9 6 9-6',
  lock: 'M6 11h12v9H6z|M9 11V8a3 3 0 016 0v3'
};
window.Icon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ledger/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ledger/InvoicesScreen.jsx
try { (() => {
// Invoices — primary product view: KPI row, filter tabs, ledger table.
const NS = window.UniversalDesignSystem_31e94a;
const {
  Card,
  Badge,
  Tabs,
  IconButton,
  Button,
  Tag
} = NS;
const Icon = window.Icon;
const INVOICES = [{
  id: 'INV-2026-0417',
  client: 'Acme Corp',
  email: 'ap@acme.com',
  amount: 12480.0,
  due: 'Jul 22',
  status: 'due'
}, {
  id: 'INV-2026-0416',
  client: 'Vantage Labs',
  email: 'billing@vantage.io',
  amount: 3200.0,
  due: 'Jul 18',
  status: 'overdue'
}, {
  id: 'INV-2026-0415',
  client: 'Northwind Studio',
  email: 'finance@northwind.co',
  amount: 8750.0,
  due: 'Aug 01',
  status: 'sent'
}, {
  id: 'INV-2026-0414',
  client: 'Pallas Group',
  email: 'pay@pallas.com',
  amount: 5400.0,
  due: 'Jul 12',
  status: 'paid'
}, {
  id: 'INV-2026-0413',
  client: 'Cobalt & Finch',
  email: 'ar@cobaltfinch.com',
  amount: 2150.0,
  due: 'Jul 09',
  status: 'paid'
}, {
  id: 'INV-2026-0412',
  client: 'Meridian Health',
  email: 'invoices@meridian.org',
  amount: 19900.0,
  due: 'Aug 06',
  status: 'draft'
}];
const STATUS = {
  paid: {
    tone: 'success',
    label: 'Paid'
  },
  due: {
    tone: 'warning',
    label: 'Due soon'
  },
  overdue: {
    tone: 'danger',
    label: 'Overdue'
  },
  sent: {
    tone: 'info',
    label: 'Sent'
  },
  draft: {
    tone: 'neutral',
    label: 'Draft'
  }
};
const money = n => n.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD'
});
function Stat({
  label,
  value,
  delta,
  deltaTone
}) {
  return /*#__PURE__*/React.createElement(Card, {
    padded: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-stat__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "lg-stat__value"
  }, value), delta && /*#__PURE__*/React.createElement("div", {
    className: "lg-stat__delta",
    "data-tone": deltaTone
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrowUp",
    size: 13
  }), delta));
}
function InvoicesScreen({
  onOpen
}) {
  const [tab, setTab] = React.useState('all');
  const rows = tab === 'all' ? INVOICES : INVOICES.filter(r => tab === 'open' ? ['due', 'overdue', 'sent'].includes(r.status) : r.status === tab);
  return /*#__PURE__*/React.createElement("div", {
    className: "lg-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-stats"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Outstanding",
    value: "$44,730",
    delta: "12.4% vs last month",
    deltaTone: "up"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Overdue",
    value: "$3,200",
    delta: "1 invoice",
    deltaTone: "down"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Paid this month",
    value: "$7,550",
    delta: "on 2 invoices",
    deltaTone: "flat"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Avg. days to pay",
    value: "18.2",
    delta: "2.1 days faster",
    deltaTone: "up"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lg-tablecard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-tabletop"
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      value: 'all',
      label: 'All',
      count: 42
    }, {
      value: 'open',
      label: 'Open',
      count: 3
    }, {
      value: 'overdue',
      label: 'Overdue',
      count: 1
    }, {
      value: 'paid',
      label: 'Paid',
      count: 39
    }, {
      value: 'draft',
      label: 'Drafts'
    }]
  }), /*#__PURE__*/React.createElement("div", {
    className: "lg-tabletop__tools"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "filter",
      size: 16
    })
  }, "Filter"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 16
    })
  }, "Export"))), /*#__PURE__*/React.createElement("div", {
    className: "lg-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "lg-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Invoice"), /*#__PURE__*/React.createElement("th", null, "Client"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", {
    className: "lg-num"
  }, "Amount"), /*#__PURE__*/React.createElement("th", null, "Due"), /*#__PURE__*/React.createElement("th", {
    "aria-label": "Actions"
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    onClick: () => onOpen && onOpen(r)
  }, /*#__PURE__*/React.createElement("td", {
    className: "lg-mono"
  }, r.id), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "lg-client"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lg-client__name"
  }, r.client), /*#__PURE__*/React.createElement("span", {
    className: "lg-client__email"
  }, r.email))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    tone: STATUS[r.status].tone,
    dot: true
  }, STATUS[r.status].label)), /*#__PURE__*/React.createElement("td", {
    className: "lg-num lg-mono"
  }, money(r.amount)), /*#__PURE__*/React.createElement("td", {
    className: "lg-due"
  }, r.due), /*#__PURE__*/React.createElement("td", {
    className: "lg-rowact"
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "More",
    size: "sm",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "more",
      size: 18
    })
  })))))))));
}
Object.assign(window, {
  InvoicesScreen,
  INVOICES,
  STATUS,
  money
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ledger/InvoicesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ledger/LoginScreen.jsx
try { (() => {
// Login — single-purpose entry screen. One primary action.
const {
  Input,
  Button,
  Checkbox
} = window.UniversalDesignSystem_31e94a;
const Icon = window.Icon;
function LoginScreen({
  onSignIn
}) {
  const [email, setEmail] = React.useState('mara@northwind.co');
  const [pw, setPw] = React.useState('••••••••••');
  const [busy, setBusy] = React.useState(false);
  const submit = e => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onSignIn && onSignIn();
    }, 550);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "lg-login"
  }, /*#__PURE__*/React.createElement("form", {
    className: "lg-login__card",
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-brand lg-brand--lg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lg-brand__mark"
  }, "L"), /*#__PURE__*/React.createElement("span", {
    className: "lg-brand__name"
  }, "Ledger")), /*#__PURE__*/React.createElement("h1", {
    className: "lg-login__title"
  }, "Sign in to your workspace"), /*#__PURE__*/React.createElement("p", {
    className: "lg-login__sub"
  }, "Invoicing that stays out of your way."), /*#__PURE__*/React.createElement("div", {
    className: "lg-login__fields"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    type: "email",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 18
    }),
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 18
    }),
    value: pw,
    onChange: e => setPw(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "lg-login__row"
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Keep me signed in",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Forgot password?"))), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    fullWidth: true,
    loading: busy
  }, "Sign in"), /*#__PURE__*/React.createElement("p", {
    className: "lg-login__foot"
  }, "New to Ledger? ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Create an account"))));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ledger/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ledger/OverviewScreen.jsx
try { (() => {
// Overview — home dashboard. Signature element: the cashflow bar strip.
const {
  Card,
  Badge,
  Button
} = window.UniversalDesignSystem_31e94a;
const Icon = window.Icon;
const CASHFLOW = [{
  m: 'Feb',
  v: 28
}, {
  m: 'Mar',
  v: 41
}, {
  m: 'Apr',
  v: 36
}, {
  m: 'May',
  v: 52
}, {
  m: 'Jun',
  v: 47
}, {
  m: 'Jul',
  v: 63
}, {
  m: 'Aug',
  v: 22,
  projected: true
}];
const ACTIVITY = [{
  icon: 'check',
  tone: 'success',
  text: 'Pallas Group paid INV-2026-0414',
  meta: '2h ago'
}, {
  icon: 'send',
  tone: 'info',
  text: 'Reminder sent to Vantage Labs',
  meta: '5h ago'
}, {
  icon: 'invoice',
  tone: 'accent',
  text: 'You created INV-2026-0417',
  meta: 'Yesterday'
}, {
  icon: 'mail',
  tone: 'neutral',
  text: 'Meridian Health opened their invoice',
  meta: 'Yesterday'
}];
function OverviewScreen() {
  const max = Math.max(...CASHFLOW.map(d => d.v));
  return /*#__PURE__*/React.createElement("div", {
    className: "lg-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-overview"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "lg-signature"
  }, /*#__PURE__*/React.createElement(Card.Header, {
    title: "Cashflow",
    description: "Collected revenue \xB7 last 6 months + projection"
  }), /*#__PURE__*/React.createElement(Card.Body, null, /*#__PURE__*/React.createElement("div", {
    className: "lg-bars"
  }, CASHFLOW.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.m,
    className: "lg-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-bar__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: `lg-bar__fill${d.projected ? ' lg-bar__fill--proj' : ''}`,
    style: {
      height: `${d.v / max * 100}%`
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "lg-bar__amt"
  }, d.v, "k"), /*#__PURE__*/React.createElement("span", {
    className: "lg-bar__m"
  }, d.m)))))), /*#__PURE__*/React.createElement(Card, {
    className: "lg-activity"
  }, /*#__PURE__*/React.createElement(Card.Header, {
    title: "Recent activity"
  }), /*#__PURE__*/React.createElement(Card.Body, null, /*#__PURE__*/React.createElement("ul", {
    className: "lg-feed"
  }, ACTIVITY.map((a, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    className: "lg-feed__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lg-feed__ico",
    "data-tone": a.tone
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.icon,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "lg-feed__text"
  }, a.text), /*#__PURE__*/React.createElement("span", {
    className: "lg-feed__meta"
  }, a.meta))))))));
}
window.OverviewScreen = OverviewScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ledger/OverviewScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ledger/Shell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Ledger — persistent app shell: sidebar + top bar. Composes DS components.
const {
  Badge,
  IconButton,
  Button
} = window.UniversalDesignSystem_31e94a;
const Icon = window.Icon;
function NavItem({
  icon,
  label,
  active,
  count,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "lg-nav__item",
    "data-active": active || undefined,
    onClick: onClick
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  }), /*#__PURE__*/React.createElement("span", null, label), count != null && /*#__PURE__*/React.createElement("span", {
    className: "lg-nav__count"
  }, count));
}
function Sidebar({
  route,
  setRoute
}) {
  const items = [{
    id: 'home',
    icon: 'home',
    label: 'Overview'
  }, {
    id: 'invoices',
    icon: 'invoice',
    label: 'Invoices',
    count: 3
  }, {
    id: 'clients',
    icon: 'clients',
    label: 'Clients'
  }, {
    id: 'reports',
    icon: 'reports',
    label: 'Reports'
  }, {
    id: 'settings',
    icon: 'settings',
    label: 'Settings'
  }];
  return /*#__PURE__*/React.createElement("aside", {
    className: "lg-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lg-brand__mark"
  }, "L"), /*#__PURE__*/React.createElement("span", {
    className: "lg-brand__name"
  }, "Ledger")), /*#__PURE__*/React.createElement("nav", {
    className: "lg-nav"
  }, items.map(it => /*#__PURE__*/React.createElement(NavItem, _extends({
    key: it.id
  }, it, {
    active: route === it.id,
    onClick: () => setRoute(it.id)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "lg-sidebar__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-user"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lg-user__avatar"
  }, "MB"), /*#__PURE__*/React.createElement("div", {
    className: "lg-user__meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-user__name"
  }, "Mara Blake"), /*#__PURE__*/React.createElement("div", {
    className: "lg-user__org"
  }, "Northwind Studio")), /*#__PURE__*/React.createElement(IconButton, {
    label: "Sign out",
    size: "sm",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "logout",
      size: 18
    })
  }))));
}
function TopBar({
  title,
  onSearch,
  onCreate
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "lg-topbar"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "lg-topbar__title"
  }, title), /*#__PURE__*/React.createElement("button", {
    className: "lg-search",
    onClick: onSearch
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Search or jump to\u2026"), /*#__PURE__*/React.createElement("kbd", {
    className: "lg-kbd"
  }, "\u2318K")), /*#__PURE__*/React.createElement("div", {
    className: "lg-topbar__actions"
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Notifications",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "bell",
      size: 20
    })
  }), /*#__PURE__*/React.createElement(Button, {
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 18
    }),
    onClick: onCreate
  }, "Create invoice")));
}
Object.assign(window, {
  Sidebar,
  TopBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ledger/Shell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.CommandPalette = __ds_scope.CommandPalette;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
