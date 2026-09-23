/* @ds-bundle: {"format":4,"namespace":"CoffeeOSDesignSystem_372546","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"SegmentedControl","sourcePath":"components/buttons/SegmentedControl.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"BatchCard","sourcePath":"components/data-display/BatchCard.jsx"},{"name":"DataTable","sourcePath":"components/data-display/DataTable.jsx"},{"name":"EmptyState","sourcePath":"components/data-display/EmptyState.jsx"},{"name":"HeroMetric","sourcePath":"components/data-display/HeroMetric.jsx"},{"name":"Kbd","sourcePath":"components/data-display/Kbd.jsx"},{"name":"RoastMeter","sourcePath":"components/data-display/RoastMeter.jsx"},{"name":"RoastDot","sourcePath":"components/data-display/RoastMeter.jsx"},{"name":"StatStrip","sourcePath":"components/data-display/StatStrip.jsx"},{"name":"InlineBanner","sourcePath":"components/feedback/InlineBanner.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"ToastViewport","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"AppShell","sourcePath":"components/navigation/AppShell.jsx"},{"name":"BatchStrip","sourcePath":"components/navigation/BatchStrip.jsx"},{"name":"Breadcrumbs","sourcePath":"components/navigation/Breadcrumbs.jsx"},{"name":"CommandPalette","sourcePath":"components/navigation/CommandPalette.jsx"},{"name":"StepStrip","sourcePath":"components/navigation/StepStrip.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Wordmark","sourcePath":"components/navigation/Wordmark.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"d643c5b9496c","components/buttons/IconButton.jsx":"e1d700486511","components/buttons/SegmentedControl.jsx":"0b35d0df1773","components/data-display/Badge.jsx":"0ced5987fd1a","components/data-display/BatchCard.jsx":"cc78bd6a8018","components/data-display/DataTable.jsx":"12b71dde28f8","components/data-display/EmptyState.jsx":"8aaee45388fd","components/data-display/HeroMetric.jsx":"53ab9f56cf1c","components/data-display/Kbd.jsx":"899b67a3b2cf","components/data-display/RoastMeter.jsx":"3bb941b755d2","components/data-display/StatStrip.jsx":"2b67aac36052","components/feedback/InlineBanner.jsx":"6fef08286b41","components/feedback/Modal.jsx":"9434dad64e0c","components/feedback/Toast.jsx":"5bb7c170fb0b","components/feedback/Tooltip.jsx":"e6777ade009d","components/forms/Checkbox.jsx":"0a875c7c7043","components/forms/Field.jsx":"ccb57d735031","components/forms/Input.jsx":"cb3d9a007f22","components/forms/Radio.jsx":"9e6919fc5730","components/forms/Select.jsx":"4ae1d34120b0","components/forms/Switch.jsx":"6b7b708665b5","components/forms/Textarea.jsx":"d9df0409f647","components/navigation/AppShell.jsx":"5d1302b04438","components/navigation/BatchStrip.jsx":"d37054054bc3","components/navigation/Breadcrumbs.jsx":"fe3ae2a8fc9a","components/navigation/CommandPalette.jsx":"eec356b4e0e7","components/navigation/StepStrip.jsx":"eba87836c288","components/navigation/Tabs.jsx":"5d720b580ded","components/navigation/Wordmark.jsx":"cbf264809e93","ui_kits/orders/OrdersScreen.jsx":"d56030f380ed","ui_kits/roast-batch/RoastBatchScreen.jsx":"4b1be89c21f9","ui_kits/shared/icons.jsx":"99e2e2cc0b41"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CoffeeOSDesignSystem_372546 = window.CoffeeOSDesignSystem_372546 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* CoffeeOS Button — action=ink (never red). Variants: primary | secondary |
   tertiary | destructive. Sizes: sm | md. Destructive is only for confirm dialogs. */
const SIZES = {
  sm: {
    fontSize: 'var(--fs-label)',
    padding: '6px 12px',
    height: 30,
    gap: 6,
    icon: 15
  },
  md: {
    fontSize: 'var(--fs-body)',
    padding: '9px 16px',
    height: 38,
    gap: 8,
    icon: 17
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--action)',
    color: 'var(--on-action)',
    border: '1px solid var(--action)'
  },
  secondary: {
    background: 'var(--surface-sunken)',
    color: 'var(--ink)',
    border: '1px solid var(--hairline-strong)'
  },
  tertiary: {
    background: 'transparent',
    color: 'var(--ink)',
    border: '1px solid transparent'
  },
  destructive: {
    background: 'var(--danger)',
    color: '#fff',
    border: '1px solid var(--danger)'
  }
};
const HOVER = {
  primary: 'var(--action-hover)',
  secondary: '#E9E6E1',
  tertiary: 'var(--surface-sunken)',
  destructive: 'var(--danger-hover)'
};
function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  disabled,
  fullWidth,
  type = 'button',
  children,
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const [hover, setHover] = React.useState(false);
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--fw-medium)',
    fontSize: s.fontSize,
    lineHeight: 1,
    padding: s.padding,
    minHeight: s.height,
    borderRadius: 'var(--r-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    transition: 'background var(--motion),border-color var(--motion),color var(--motion)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...v
  };
  if (hover && !disabled) base.background = HOVER[variant] || base.background;
  if (disabled) Object.assign(base, {
    background: variant === 'tertiary' ? 'transparent' : 'var(--surface-sunken)',
    color: 'var(--ink-subtle)',
    borderColor: 'var(--hairline)',
    opacity: variant === 'tertiary' ? .5 : 1
  });
  const ic = n => n ? React.cloneElement(n, {
    width: s.icon,
    height: s.icon,
    style: {
      flex: 'none',
      ...(n.props.style || {})
    }
  }) : null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    style: {
      ...base,
      ...style
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), ic(iconLeft), children, ic(iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* CoffeeOS IconButton — square, icon-only control. Variants match Button minus
   destructive-by-default. Always pass an aria-label. */
const SIZES = {
  sm: {
    box: 30,
    icon: 16
  },
  md: {
    box: 38,
    icon: 18
  }
};
const VARIANTS = {
  default: {
    background: 'transparent',
    color: 'var(--ink-muted)',
    border: '1px solid transparent',
    hover: 'var(--surface-sunken)',
    hoverColor: 'var(--ink)'
  },
  outline: {
    background: 'var(--surface)',
    color: 'var(--ink)',
    border: '1px solid var(--hairline-strong)',
    hover: 'var(--surface-sunken)',
    hoverColor: 'var(--ink)'
  },
  solid: {
    background: 'var(--action)',
    color: 'var(--on-action)',
    border: '1px solid var(--action)',
    hover: 'var(--action-hover)',
    hoverColor: 'var(--on-action)'
  }
};
function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  disabled,
  active,
  'aria-label': label,
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.default;
  const [hover, setHover] = React.useState(false);
  const st = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: s.box,
    height: s.box,
    borderRadius: 'var(--r-md)',
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--motion),color var(--motion),border-color var(--motion)',
    background: v.background,
    color: v.color,
    border: v.border
  };
  if (active) {
    st.background = 'var(--brand-soft)';
    st.color = 'var(--brand)';
  }
  if (hover && !disabled && !active) {
    st.background = v.hover;
    st.color = v.hoverColor;
  }
  if (disabled) {
    st.color = 'var(--ink-subtle)';
    st.cursor = 'not-allowed';
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    disabled: disabled,
    style: {
      ...st,
      ...style
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), icon ? React.cloneElement(icon, {
    width: s.icon,
    height: s.icon
  }) : null);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/buttons/SegmentedControl.jsx
try { (() => {
/* CoffeeOS SegmentedControl — Roastify pattern: pill track with a dark active
   segment. options: [{value,label}] or string[]. Single-select. */
function SegmentedControl({
  options = [],
  value,
  onChange,
  size = 'md',
  style
}) {
  const opts = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  const pad = size === 'sm' ? '5px 12px' : '7px 14px';
  const fs = size === 'sm' ? 'var(--fs-label)' : 'var(--fs-body)';
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'inline-flex',
      padding: 3,
      gap: 2,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-md)',
      ...style
    }
  }, opts.map(o => {
    const on = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(o.value),
      style: {
        appearance: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: pad,
        fontSize: fs,
        fontFamily: 'var(--font-sans)',
        fontWeight: on ? 'var(--fw-medium)' : 'var(--fw-regular)',
        color: on ? 'var(--on-action)' : 'var(--ink-muted)',
        background: on ? 'var(--action)' : 'transparent',
        borderRadius: 'calc(var(--r-md) - 2px)',
        transition: 'background var(--motion),color var(--motion)',
        whiteSpace: 'nowrap'
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
/* CoffeeOS Badge — pill label for status, counts, and small tags.
   tone: neutral | brand | success | warning | danger | info.
   variant: soft (tinted, default) | solid | outline.
   Count badges use tone="brand" (the live register). */
const TONES = {
  neutral: {
    fg: 'var(--ink-muted)',
    bg: 'var(--surface-sunken)',
    bd: 'var(--hairline-strong)',
    solidBg: 'var(--ink)'
  },
  brand: {
    fg: 'var(--brand-hover)',
    bg: 'var(--brand-soft)',
    bd: '#F6CEC9',
    solidBg: 'var(--brand)'
  },
  success: {
    fg: 'var(--success)',
    bg: 'var(--success-soft)',
    bd: '#BFE2CD',
    solidBg: 'var(--success)'
  },
  warning: {
    fg: 'var(--warning)',
    bg: 'var(--warning-soft)',
    bd: '#EAD3A6',
    solidBg: 'var(--warning)'
  },
  danger: {
    fg: 'var(--danger)',
    bg: 'var(--danger-soft)',
    bd: '#EEC7C2',
    solidBg: 'var(--danger)'
  },
  info: {
    fg: 'var(--info)',
    bg: 'var(--info-soft)',
    bd: '#C6D5EC',
    solidBg: 'var(--info)'
  }
};
function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  dot,
  pulse,
  mono,
  size = 'md',
  style
}) {
  const t = TONES[tone] || TONES.neutral;
  const pad = size === 'sm' ? '1px 7px' : '2px 9px';
  const fs = size === 'sm' ? 'var(--fs-overline)' : 'var(--fs-caption)';
  let st = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: pad,
    fontSize: fs,
    lineHeight: 1.5,
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
    fontVariationSettings: mono ? 'var(--data-settings)' : 'normal',
    fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
    fontWeight: 'var(--fw-medium)',
    borderRadius: 'var(--r-pill)',
    whiteSpace: 'nowrap',
    letterSpacing: mono ? '.01em' : '0'
  };
  if (variant === 'solid') st = {
    ...st,
    background: t.solidBg,
    color: '#fff',
    border: '1px solid transparent'
  };else if (variant === 'outline') st = {
    ...st,
    background: 'transparent',
    color: t.fg,
    border: `1px solid ${t.bd}`
  };else st = {
    ...st,
    background: t.bg,
    color: t.fg,
    border: `1px solid ${t.bd}`
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      ...st,
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: pulse ? 'coffeeos-pulse' : undefined,
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'currentColor',
      flex: 'none',
      animation: pulse ? 'coffeeos-pulse 1.8s var(--ease) infinite' : 'none'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/EmptyState.jsx
try { (() => {
/* CoffeeOS EmptyState — display headline (Martian Mono wide), one line of
   guidance (sans), one primary action. Invites an action; never a dead end. */
function EmptyState({
  icon,
  title,
  description,
  action,
  compact,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 10,
      padding: compact ? '32px 24px' : '56px 24px',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--r-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--hairline)',
      color: 'var(--ink-muted)',
      marginBottom: 4
    }
  }, React.cloneElement(icon, {
    width: 20,
    height: 20
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--display-settings)',
      fontWeight: 'var(--display-weight)',
      letterSpacing: 'var(--display-tracking)',
      fontSize: 'var(--fs-title)',
      textTransform: 'uppercase',
      color: 'var(--ink)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body)',
      color: 'var(--ink-muted)',
      maxWidth: 380,
      lineHeight: 'var(--lh-body)'
    }
  }, description), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/data-display/HeroMetric.jsx
try { (() => {
/* CoffeeOS HeroMetric — ONE figure at display size, sitting directly on the
   canvas with a hairline rule under it. The worksheet answer to a KPI-card row:
   a screen has one hero, not four equal boxes. */
function HeroMetric({
  label,
  value,
  unit,
  delta,
  deltaDir,
  note,
  style
}) {
  const dir = deltaDir || (delta && String(delta).trim().startsWith('-') ? 'down' : 'up');
  const good = dir === 'up';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      paddingBottom: 16,
      borderBottom: '2px solid var(--ink)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariationSettings: 'var(--overline-settings)',
      fontWeight: 'var(--overline-weight)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--overline-tracking)',
      fontSize: 'var(--fs-overline)',
      color: 'var(--ink-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--display-settings)',
      fontWeight: 'var(--display-weight)',
      letterSpacing: 'var(--display-tracking)',
      fontSize: 'var(--fs-hero)',
      lineHeight: .9,
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariationSettings: 'var(--data-settings)',
      fontSize: 'var(--fs-body-lg)',
      color: 'var(--ink-muted)',
      paddingBottom: 6
    }
  }, unit), delta != null && /*#__PURE__*/React.createElement("span", {
    style: {
      marginBottom: 8,
      fontFamily: 'var(--font-mono)',
      fontVariationSettings: 'var(--data-settings)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'var(--fs-body)',
      fontWeight: 500,
      color: good ? 'var(--success)' : 'var(--danger)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, good ? '↑' : '↓'), delta)), note && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--ink-subtle)'
    }
  }, note));
}
Object.assign(__ds_scope, { HeroMetric });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/HeroMetric.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Kbd.jsx
try { (() => {
/* CoffeeOS Kbd — mono keyboard chip for shortcuts in menus, tooltips, palette. */
function Kbd({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("kbd", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 18,
      height: 18,
      padding: '0 5px',
      fontFamily: 'var(--font-mono)',
      fontVariationSettings: 'var(--data-settings)',
      fontSize: 'var(--fs-overline)',
      fontWeight: 500,
      color: 'var(--ink-muted)',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--hairline-strong)',
      borderRadius: 'var(--r-sm)',
      lineHeight: 1,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Kbd });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Kbd.jsx", error: String((e && e.message) || e) }); }

// components/data-display/RoastMeter.jsx
try { (() => {
/* CoffeeOS RoastMeter — segmented roast scale drawn from the roast ramp
   (green→espresso). Each filled segment shows its own ramp color, so the meter
   is a self-labeling readout, paired with a condensed-mono label. Data layer. */
const RAMP = ['var(--roast-1)', 'var(--roast-2)', 'var(--roast-3)', 'var(--roast-4)', 'var(--roast-5)'];
const NAMES = {
  1: 'LIGHT',
  2: 'MED-LIGHT',
  3: 'MEDIUM',
  4: 'MED-DARK',
  5: 'DARK'
};
const SIZES = {
  sm: {
    seg: 12,
    h: 7,
    gap: 2,
    fs: 'var(--fs-overline)'
  },
  md: {
    seg: 18,
    h: 9,
    gap: 2,
    fs: 'var(--fs-caption)'
  },
  lg: {
    seg: 26,
    h: 11,
    gap: 3,
    fs: 'var(--fs-label)'
  }
};
function RoastMeter({
  level = 3,
  size = 'md',
  showLabel = true,
  label,
  style
}) {
  const s = SIZES[size] || SIZES.md;
  const lvl = Math.max(0, Math.min(5, Math.round(level)));
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-label": `Roast level ${lvl} of 5`,
    role: "img",
    style: {
      display: 'inline-flex',
      gap: s.gap
    }
  }, RAMP.map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: s.seg,
      height: s.h,
      borderRadius: 2,
      background: i < lvl ? c : 'var(--roast-empty)',
      transition: 'background var(--motion)'
    }
  }))), showLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariationSettings: 'var(--overline-settings)',
      fontWeight: 'var(--overline-weight)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--overline-tracking)',
      fontSize: s.fs,
      color: 'var(--ink-muted)',
      whiteSpace: 'nowrap'
    }
  }, label || NAMES[lvl] || '—', " \xB7 ", lvl, "/5"));
}

/* RoastDot — a single ramp-colored marker for table rows / list items. */
function RoastDot({
  level = 3,
  size = 8,
  style
}) {
  const lvl = Math.max(0, Math.min(5, Math.round(level)));
  const c = ['var(--roast-0)', 'var(--roast-1)', 'var(--roast-2)', 'var(--roast-3)', 'var(--roast-4)', 'var(--roast-5)'][lvl];
  return /*#__PURE__*/React.createElement("span", {
    title: `Roast ${lvl}/5`,
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: 2,
      background: c,
      flex: 'none',
      ...style
    }
  });
}
Object.assign(__ds_scope, { RoastMeter, RoastDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/RoastMeter.jsx", error: String((e && e.message) || e) }); }

// components/data-display/BatchCard.jsx
try { (() => {
/* CoffeeOS BatchCard — roasting batch summary (a genuinely modular container, so
   a bordered card is warranted). Condensed-mono specs, roast meter, status badge. */
const STATUS = {
  roasting: {
    tone: 'brand',
    label: 'Roasting',
    pulse: true
  },
  queued: {
    tone: 'neutral',
    label: 'Queued'
  },
  cooling: {
    tone: 'info',
    label: 'Cooling'
  },
  done: {
    tone: 'success',
    label: 'Complete'
  }
};
function BatchCard({
  batchId,
  lot,
  origin,
  roastLevel = 3,
  status = 'queued',
  rows = [],
  footer,
  style
}) {
  const s = STATUS[status] || STATUS.queued;
  const mono = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--data-settings)',
    fontVariantNumeric: 'tabular-nums'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 'var(--fs-data)',
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, batchId), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--ink-muted)',
      marginTop: 2
    }
  }, origin, lot ? /*#__PURE__*/React.createElement("span", {
    style: mono
  }, " \xB7 ", lot) : null)), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: s.tone,
    dot: true,
    pulse: s.pulse
  }, s.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.RoastMeter, {
    level: roastLevel,
    size: "md"
  }), rows.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px 16px'
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariationSettings: 'var(--overline-settings)',
      fontWeight: 'var(--overline-weight)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--overline-tracking)',
      fontSize: 'var(--fs-overline)',
      color: 'var(--ink-muted)'
    }
  }, r.label), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 'var(--fs-data)',
      color: 'var(--ink)'
    }
  }, r.value))))), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px',
      borderTop: '1px solid var(--hairline)',
      background: 'var(--surface-sunken)'
    }
  }, footer));
}
Object.assign(__ds_scope, { BatchCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/BatchCard.jsx", error: String((e && e.message) || e) }); }

// components/data-display/StatStrip.jsx
try { (() => {
/* CoffeeOS StatStrip — the secondary metrics as ONE ruled line: overline label
   above, condensed-mono figure below, hairline dividers between. Never a row of
   equal cards. stats: [{label,value,unit,delta,deltaDir,tone}] */
function StatStrip({
  stats = [],
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-md)',
      background: 'var(--surface)',
      overflow: 'hidden',
      ...style
    }
  }, stats.map((s, i) => {
    const dir = s.deltaDir || (s.delta && String(s.delta).trim().startsWith('-') ? 'down' : 'up');
    const good = dir === 'up';
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '12px 16px',
        borderLeft: i ? '1px solid var(--hairline)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontVariationSettings: 'var(--overline-settings)',
        fontWeight: 'var(--overline-weight)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--overline-tracking)',
        fontSize: 'var(--fs-overline)',
        color: 'var(--ink-muted)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, s.label), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        columnGap: 6,
        rowGap: 2,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontVariationSettings: 'var(--data-settings)',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 500,
        fontSize: 'var(--fs-data-lg)',
        color: s.tone === 'live' ? 'var(--brand)' : 'var(--ink)',
        lineHeight: 1
      }
    }, s.value), s.unit && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontVariationSettings: 'var(--data-settings)',
        fontSize: 'var(--fs-caption)',
        color: 'var(--ink-subtle)'
      }
    }, s.unit), s.delta != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontVariationSettings: 'var(--data-settings)',
        fontVariantNumeric: 'tabular-nums',
        fontSize: 'var(--fs-caption)',
        color: good ? 'var(--success)' : 'var(--danger)'
      }
    }, good ? '↑' : '↓', s.delta)));
  }));
}
Object.assign(__ds_scope, { StatStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/StatStrip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/InlineBanner.jsx
try { (() => {
/* CoffeeOS InlineBanner — in-page message. tone: info | success | warning |
   danger | neutral. Soft tint, hairline, tone-colored left accent + icon.
   States what's happening and (for warnings/errors) how to fix it. */
const CFG = {
  info: {
    soft: 'var(--info-soft)',
    fg: 'var(--info)',
    bd: '#C6D5EC'
  },
  success: {
    soft: 'var(--success-soft)',
    fg: 'var(--success)',
    bd: '#BFE2CD'
  },
  warning: {
    soft: 'var(--warning-soft)',
    fg: 'var(--warning)',
    bd: '#EAD3A6'
  },
  danger: {
    soft: 'var(--danger-soft)',
    fg: 'var(--danger)',
    bd: '#EEC7C2'
  },
  neutral: {
    soft: 'var(--surface-sunken)',
    fg: 'var(--ink-muted)',
    bd: 'var(--hairline-strong)'
  }
};
const ICONS = {
  info: 'M12 16v-4M12 8h.01',
  success: 'M20 6L9 17l-5-5',
  warning: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  danger: 'M12 8v4M12 16h.01',
  neutral: 'M12 16v-4M12 8h.01'
};
function InlineBanner({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  style
}) {
  const c = CFG[tone] || CFG.info;
  const circle = tone !== 'warning' && tone !== 'success';
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      gap: 12,
      padding: '12px 14px',
      background: c.soft,
      border: `1px solid ${c.bd}`,
      borderRadius: 'var(--r-md)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c.fg,
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flex: 'none',
      marginTop: 1
    }
  }, circle && /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: ICONS[tone]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, title && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-label)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--ink)'
    }
  }, title), children && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-body)',
      color: 'var(--ink-muted)',
      lineHeight: 'var(--lh-body)'
    }
  }, children), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, action)), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--ink-muted)',
      padding: 2,
      flex: 'none',
      height: 'fit-content'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { InlineBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/InlineBanner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
/* CoffeeOS Modal — centered dialog with scrim, hairline card, real shadow.
   Destructive confirmations live here (the one place a filled danger button
   appears). tone="danger" tints the header accent. */
function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  tone = 'default',
  width = 480
}) {
  React.useEffect(() => {
    if (!open) return;
    const h = e => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose && onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 'var(--z-modal)',
      background: 'rgba(36,24,18,.38)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      animation: 'coffeeos-fade var(--dur) var(--ease)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      maxWidth: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-modal)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-title-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: tone === 'danger' ? 'var(--danger)' : 'var(--ink)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-body)',
      color: 'var(--ink-muted)',
      lineHeight: 'var(--lh-body)'
    }
  }, description)), children && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px',
      marginTop: 'auto',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      borderTop: '1px solid var(--hairline)'
    }
  }, footer)), /*#__PURE__*/React.createElement("style", null, `@keyframes coffeeos-fade{from{opacity:0}to{opacity:1}}`));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/* CoffeeOS Toast — transient confirmation. White card, hairline, pop shadow,
   tone dot. Verb carries from the action ("3 orders marked fulfilled."). */
const DOT = {
  neutral: 'var(--ink)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)'
};
function Toast({
  tone = 'neutral',
  title,
  children,
  action,
  onDismiss,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      minWidth: 280,
      maxWidth: 400,
      padding: '12px 14px',
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--shadow-pop)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: DOT[tone] || DOT.neutral,
      flex: 'none',
      marginTop: 6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, title && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-label)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--ink)'
    }
  }, title), children && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--ink-muted)'
    }
  }, children)), action, onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--ink-subtle)',
      padding: 2,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  }))));
}

/* Fixed bottom-right stack container. */
function ToastViewport({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 20,
      bottom: 20,
      zIndex: 'var(--z-toast)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, children);
}
Object.assign(__ds_scope, { Toast, ToastViewport });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/* CoffeeOS Tooltip — hover/focus label on --ink, small mono-friendly. */
function Tooltip({
  label,
  side = 'top',
  children,
  style
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    bottom: {
      top: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    left: {
      right: 'calc(100% + 6px)',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    right: {
      left: 'calc(100% + 6px)',
      top: '50%',
      transform: 'translateY(-50%)'
    }
  }[side];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      zIndex: 'var(--z-popover)',
      ...pos,
      background: 'var(--ink)',
      color: 'var(--on-ink)',
      fontSize: 'var(--fs-caption)',
      lineHeight: 1.4,
      fontFamily: 'var(--font-sans)',
      padding: '6px 9px',
      borderRadius: 'var(--r-sm)',
      whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow-pop)',
      pointerEvents: 'none'
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* CoffeeOS Checkbox — ink-filled when checked (not red), brand focus ring.
   Supports indeterminate for table "select all". */
function Checkbox({
  checked,
  indeterminate,
  disabled,
  label,
  onChange,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
  }, [indeterminate, checked]);
  const on = checked || indeterminate;
  const box = {
    width: 18,
    height: 18,
    flex: 'none',
    borderRadius: 5,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: on ? 'var(--action)' : 'var(--surface)',
    border: `1px solid ${on ? 'var(--action)' : 'var(--hairline-strong)'}`,
    boxShadow: focus ? '0 0 0 3px var(--brand-ring)' : 'none',
    transition: 'background var(--motion),border-color var(--motion),box-shadow var(--motion)',
    color: '#fff'
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: box
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    type: "checkbox",
    checked: !!checked,
    disabled: disabled,
    onChange: onChange,
    id: id,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  })), indeterminate && !checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-body)',
      color: 'var(--ink)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/data-display/DataTable.jsx
try { (() => {
/* CoffeeOS DataTable — the worksheet workhorse. Edge-to-edge (no outer card by
   default), sticky sunken header with condensed-mono OVERLINE column labels,
   dense ruled rows (no zebra), condensed-mono figures, hover-revealed row
   actions on the right, and a bulk action bar that slides up from the bottom.
   Column: {key,header,align,mono,sortable,width,grow,render}. */
function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sort,
  onSortChange,
  onRowClick,
  rowActions,
  bulkActions,
  empty,
  stickyTop = 0,
  container = false,
  style
}) {
  const [hover, setHover] = React.useState(null);
  const sel = new Set(selectedKeys);
  const allOn = rows.length > 0 && rows.every(r => sel.has(r[rowKey]));
  const someOn = rows.some(r => sel.has(r[rowKey]));
  const toggleAll = () => onSelectionChange && onSelectionChange(allOn ? [] : rows.map(r => r[rowKey]));
  const toggleRow = k => {
    const n = new Set(sel);
    n.has(k) ? n.delete(k) : n.add(k);
    onSelectionChange && onSelectionChange([...n]);
  };
  const doSort = key => {
    if (!onSortChange) return;
    const dir = sort && sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc';
    onSortChange({
      key,
      dir
    });
  };
  const overline = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--overline-settings)',
    fontWeight: 'var(--overline-weight)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--overline-tracking)',
    fontSize: 'var(--fs-overline)',
    color: 'var(--ink-muted)'
  };
  const th = {
    padding: '0 12px',
    height: 34,
    background: 'var(--surface-sunken)',
    position: 'sticky',
    top: stickyTop,
    zIndex: 2,
    borderBottom: '1px solid var(--hairline-strong)',
    whiteSpace: 'nowrap',
    ...overline
  };
  const wrap = container ? {
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--r-md)',
    overflow: 'hidden',
    background: 'var(--surface)'
  } : {
    background: 'var(--surface)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, selectable && /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      width: 40,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
    checked: allOn,
    indeterminate: someOn && !allOn,
    onChange: toggleAll
  })), columns.map(c => {
    const active = sort && sort.key === c.key;
    return /*#__PURE__*/React.createElement("th", {
      key: c.key,
      style: {
        ...th,
        textAlign: c.align || 'left',
        width: c.width,
        cursor: c.sortable ? 'pointer' : 'default',
        userSelect: 'none'
      },
      onClick: c.sortable ? () => doSort(c.key) : undefined
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start'
      }
    }, c.header, c.sortable && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        color: active ? 'var(--brand)' : 'var(--ink-subtle)',
        fontSize: 10
      }
    }, active ? sort.dir === 'asc' ? '↑' : '↓' : '↕')));
  }), rowActions && /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      width: 1
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0),
    style: {
      padding: 0
    }
  }, empty || /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 24px',
      textAlign: 'center',
      color: 'var(--ink-muted)',
      fontFamily: 'var(--font-sans)'
    }
  }, "No rows to show."))) : rows.map(r => {
    const k = r[rowKey];
    const on = sel.has(k);
    const hov = hover === k;
    return /*#__PURE__*/React.createElement("tr", {
      key: k,
      onClick: onRowClick ? () => onRowClick(r) : undefined,
      onMouseEnter: () => setHover(k),
      onMouseLeave: () => setHover(h => h === k ? null : h),
      style: {
        borderBottom: '1px solid var(--hairline)',
        cursor: onRowClick ? 'pointer' : 'default',
        background: on ? 'var(--brand-soft)' : hov ? 'var(--surface-hover)' : 'transparent',
        transition: 'background var(--motion)'
      }
    }, selectable && /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '0 12px',
        height: 40
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
      checked: on,
      onChange: () => toggleRow(k)
    })), columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        padding: '0 12px',
        height: 40,
        textAlign: c.align || 'left',
        color: 'var(--ink)',
        fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontVariationSettings: c.mono ? 'var(--data-settings)' : 'normal',
        fontVariantNumeric: c.mono ? 'tabular-nums' : 'normal',
        fontSize: c.mono ? 'var(--fs-data)' : 'var(--fs-body)',
        whiteSpace: c.wrap ? 'normal' : 'nowrap'
      }
    }, c.render ? c.render(r[c.key], r) : r[c.key])), rowActions && /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '0 12px',
        height: 40,
        textAlign: 'right',
        whiteSpace: 'nowrap'
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 4,
        opacity: hov ? 1 : 0,
        transition: 'opacity var(--motion)'
      }
    }, rowActions(r))));
  })))), selectable && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: '50%',
      bottom: 20,
      zIndex: 'var(--z-bulkbar)',
      transform: `translateX(-50%) translateY(${someOn ? '0' : '160%'})`,
      opacity: someOn ? 1 : 0,
      pointerEvents: someOn ? 'auto' : 'none',
      transition: 'transform var(--motion),opacity var(--motion)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '10px 12px 10px 16px',
      background: 'var(--ink)',
      color: 'var(--on-ink)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--shadow-modal)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariationSettings: 'var(--data-settings)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'var(--fs-label)'
    }
  }, [...sel].length, " selected"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, bulkActions), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSelectionChange && onSelectionChange([]),
    "aria-label": "Clear selection",
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--on-ink)',
      opacity: .7,
      cursor: 'pointer',
      padding: 4,
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  }))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
/* CoffeeOS Field — label + control + help/error wrapper. Errors state what
   went wrong and how to fix it. */
function Field({
  label,
  htmlFor,
  help,
  error,
  required,
  optional,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'baseline',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-label)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--ink)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brand)'
    }
  }, "*"), optional && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-subtle)',
      fontWeight: 'var(--fw-regular)'
    }
  }, "optional")), children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--danger)'
    }
  }, error) : help ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--ink-muted)'
    }
  }, help) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* CoffeeOS Input — hairline border, brand focus ring, error state.
   Supports leading/trailing adornments and mono mode for data entry (lot codes,
   weights, SKUs). */
function Input({
  size = 'md',
  invalid,
  disabled,
  leading,
  trailing,
  mono,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 30 : 38;
  const wrap = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: h,
    padding: '0 10px',
    background: disabled ? 'var(--surface-sunken)' : 'var(--surface)',
    border: `1px solid ${invalid ? 'var(--danger)' : focus ? 'var(--brand)' : 'var(--hairline-strong)'}`,
    borderRadius: 'var(--r-md)',
    boxShadow: focus ? `0 0 0 3px ${invalid ? 'var(--danger-soft)' : 'var(--brand-ring)'}` : 'none',
    transition: 'border-color var(--motion),box-shadow var(--motion)',
    color: 'var(--ink-muted)',
    cursor: disabled ? 'not-allowed' : 'text'
  };
  const inp = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
    fontVariationSettings: mono ? 'var(--data-settings)' : 'normal',
    fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
    fontSize: 'var(--fs-body)',
    color: 'var(--ink)',
    padding: 0,
    height: '100%'
  };
  const ic = n => n ? React.cloneElement(n, {
    width: 16,
    height: 16,
    style: {
      flex: 'none',
      color: 'var(--ink-subtle)'
    }
  }) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      ...style
    }
  }, ic(leading), /*#__PURE__*/React.createElement("input", _extends({
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    style: inp,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest)), ic(trailing));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* CoffeeOS Radio — single dot, ink when selected. Use RadioGroup for a set. */
function Radio({
  checked,
  disabled,
  label,
  onChange,
  name,
  value,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const box = {
    width: 18,
    height: 18,
    flex: 'none',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface)',
    border: `1px solid ${checked ? 'var(--action)' : 'var(--hairline-strong)'}`,
    boxShadow: focus ? '0 0 0 3px var(--brand-ring)' : 'none',
    transition: 'border-color var(--motion),box-shadow var(--motion)'
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: box
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    value: value,
    checked: !!checked,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--action)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-body)',
      color: 'var(--ink)'
    }
  }, label));
}
function RadioGroup({
  options = [],
  value,
  onChange,
  name = 'radio',
  direction = 'column',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    style: {
      display: 'flex',
      flexDirection: direction,
      gap: direction === 'row' ? 20 : 10,
      ...style
    }
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
/* CoffeeOS Select — native select with system chrome hidden and a chevron. */
function Select({
  size = 'md',
  invalid,
  disabled,
  children,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 30 : 38;
  const wrap = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
    height: h,
    background: disabled ? 'var(--surface-sunken)' : 'var(--surface)',
    border: `1px solid ${invalid ? 'var(--danger)' : focus ? 'var(--brand)' : 'var(--hairline-strong)'}`,
    borderRadius: 'var(--r-md)',
    boxShadow: focus ? `0 0 0 3px var(--brand-ring)` : 'none',
    transition: 'border-color var(--motion),box-shadow var(--motion)'
  };
  const sel = {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--fs-body)',
    color: disabled ? 'var(--ink-subtle)' : 'var(--ink)',
    padding: '0 32px 0 10px',
    height: '100%',
    width: '100%',
    cursor: disabled ? 'not-allowed' : 'pointer'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      ...style
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    style: sel,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest), children), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--ink-muted)",
    strokeWidth: "1.5",
    style: {
      position: 'absolute',
      right: 10,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* CoffeeOS Switch — for immediate on/off settings. Track fills --action (ink) when on. */
function Switch({
  checked,
  disabled,
  onChange,
  label,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const track = {
    position: 'relative',
    width: 38,
    height: 22,
    flex: 'none',
    borderRadius: 999,
    background: checked ? 'var(--action)' : 'var(--hairline-strong)',
    boxShadow: focus ? '0 0 0 3px var(--brand-ring)' : 'none',
    transition: 'background var(--motion),box-shadow var(--motion)'
  };
  const knob = {
    position: 'absolute',
    top: 2,
    left: checked ? 18 : 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 2px rgba(36,24,18,.25)',
    transition: 'left var(--motion)'
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: track
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: !!checked,
    disabled: disabled,
    onChange: onChange,
    id: id,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: knob
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-body)',
      color: 'var(--ink)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* CoffeeOS Textarea — multiline, hairline + brand focus. */
function Textarea({
  invalid,
  disabled,
  rows = 4,
  mono,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const st = {
    display: 'block',
    width: '100%',
    padding: '9px 10px',
    resize: 'vertical',
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
    fontSize: 'var(--fs-body)',
    lineHeight: 'var(--lh-body)',
    color: 'var(--ink)',
    background: disabled ? 'var(--surface-sunken)' : 'var(--surface)',
    border: `1px solid ${invalid ? 'var(--danger)' : focus ? 'var(--brand)' : 'var(--hairline-strong)'}`,
    borderRadius: 'var(--r-md)',
    outline: 'none',
    boxShadow: focus ? `0 0 0 3px ${invalid ? 'var(--danger-soft)' : 'var(--brand-ring)'}` : 'none',
    transition: 'border-color var(--motion),box-shadow var(--motion)'
  };
  return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    style: {
      ...st,
      ...style
    },
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BatchStrip.jsx
try { (() => {
/* CoffeeOS BatchStrip — SIGNATURE. Today's roast queue on a time axis, lives in
   the app shell. Each batch is a segment colored by target roast (the ramp); the
   currently-roasting batch is marked in --brand with a slow pulse (the only
   ambient animation). Collapsed = one line: "2 BATCHES · NEXT DROP 14:20".
   batches: [{id,roast,start,drop,status:'done'|'roasting'|'queued'}]  times "HH:MM"
   now: "HH:MM" current time marker. */
const RAMP = ['var(--roast-0)', 'var(--roast-1)', 'var(--roast-2)', 'var(--roast-3)', 'var(--roast-4)', 'var(--roast-5)'];
const toMin = t => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fmt = t => t;
function BatchStrip({
  batches = [],
  now = '13:10',
  collapsed = false,
  onToggle,
  style
}) {
  const mono = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--data-settings)',
    fontVariantNumeric: 'tabular-nums'
  };
  const overline = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--overline-settings)',
    fontWeight: 'var(--overline-weight)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--overline-tracking)',
    fontSize: 'var(--fs-overline)'
  };
  const active = batches.find(b => b.status === 'roasting');
  const next = batches.filter(b => b.status === 'queued').sort((a, b) => toMin(a.drop) - toMin(b.drop))[0];
  const nextDrop = active || next ? (active || next).drop : '—';
  if (collapsed) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onToggle,
      style: {
        width: '100%',
        height: 'var(--strip-h)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 24px',
        background: 'var(--surface)',
        border: 'none',
        borderBottom: '1px solid var(--hairline)',
        cursor: 'pointer',
        ...style
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...overline,
        color: 'var(--ink-muted)'
      }
    }, "Roast queue"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--fs-label)',
        color: 'var(--ink)'
      }
    }, batches.length, " batches"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--hairline-strong)'
      }
    }, "\xB7"), active && /*#__PURE__*/React.createElement("span", {
      className: "coffeeos-pulse",
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--brand)',
        animation: 'coffeeos-pulse 1.8s var(--ease) infinite'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--fs-label)',
        color: 'var(--ink-muted)'
      }
    }, "NEXT DROP ", nextDrop), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        ...overline,
        color: 'var(--ink-subtle)'
      }
    }, "Expand \u25BE"));
  }
  const winStart = Math.min(...batches.map(b => toMin(b.start))) - 15;
  const winEnd = Math.max(...batches.map(b => toMin(b.drop))) + 15;
  const span = Math.max(1, winEnd - winStart);
  const pct = t => (toMin(t) - winStart) / span * 100;
  const nowPct = pct(now);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: 'var(--strip-h)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 24px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--hairline)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...overline,
      color: 'var(--ink-muted)',
      whiteSpace: 'nowrap'
    }
  }, "Roast queue"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      height: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: 1,
      background: 'var(--hairline)'
    }
  }), nowPct >= 0 && nowPct <= 100 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${nowPct}%`,
      top: -3,
      bottom: -3,
      width: 2,
      background: 'var(--brand)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--brand)'
    }
  })), batches.map(b => {
    const left = pct(b.start),
      w = Math.max(2, pct(b.drop) - pct(b.start));
    const roasting = b.status === 'roasting',
      done = b.status === 'done';
    const color = RAMP[Math.max(0, Math.min(5, b.roast))];
    return /*#__PURE__*/React.createElement("div", {
      key: b.id,
      title: `${b.id} · drop ${b.drop}`,
      className: roasting ? 'coffeeos-pulse' : undefined,
      style: {
        position: 'absolute',
        left: `${left}%`,
        width: `${w}%`,
        top: '50%',
        transform: 'translateY(-50%)',
        height: 12,
        borderRadius: 3,
        background: roasting ? 'var(--brand)' : color,
        opacity: done ? .4 : 1,
        border: roasting ? 'none' : '1px solid rgba(36,24,18,.12)',
        animation: roasting ? 'coffeeos-pulse 1.8s var(--ease) infinite' : 'none'
      }
    });
  })), active && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "coffeeos-pulse",
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--brand)',
      animation: 'coffeeos-pulse 1.8s var(--ease) infinite'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 'var(--fs-label)',
      color: 'var(--ink)'
    }
  }, active.id), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 'var(--fs-label)',
      color: 'var(--ink-muted)'
    }
  }, "drop ", active.drop)), onToggle && /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    style: {
      ...overline,
      color: 'var(--ink-subtle)',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }
  }, "Collapse \u25B4"));
}
Object.assign(__ds_scope, { BatchStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BatchStrip.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumbs.jsx
try { (() => {
/* CoffeeOS Breadcrumbs — slash-separated trail; last item is the current page. */
function Breadcrumbs({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 'var(--fs-label)',
      ...style
    }
  }, items.map((b, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap'
      }
    }, i > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-subtle)'
      }
    }, "/"), last || !b.href ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: last ? 'var(--ink)' : 'var(--ink-muted)',
        fontWeight: last ? 'var(--fw-medium)' : 'var(--fw-regular)'
      },
      "aria-current": last ? 'page' : undefined
    }, b.label) : /*#__PURE__*/React.createElement("a", {
      href: b.href,
      style: {
        color: 'var(--ink-muted)',
        textDecoration: 'none'
      }
    }, b.label));
  }));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/CommandPalette.jsx
try { (() => {
/* CoffeeOS CommandPalette — ⌘K. Jump to any order, lot, batch, or screen, or run
   an action. Overlay + search; arrow keys navigate, Enter selects, Esc closes.
   groups: [{group, items:[{id,label,hint,icon,kbd,onSelect}]}] */
function CommandPalette({
  open,
  onClose,
  groups = [],
  placeholder = 'Search orders, lots, batches, or run a command…'
}) {
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 20);
    }
  }, [open]);
  const flat = [];
  const filtered = groups.map(g => {
    const items = g.items.filter(it => !q || (it.label + ' ' + (it.hint || '')).toLowerCase().includes(q.toLowerCase()));
    items.forEach(it => flat.push(it));
    return {
      ...g,
      items
    };
  }).filter(g => g.items.length);
  React.useEffect(() => {
    if (!open) return;
    const h = e => {
      if (e.key === 'Escape') {
        onClose && onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIdx(i => Math.min(flat.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIdx(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = flat[idx];
        if (it) {
          it.onSelect && it.onSelect();
          onClose && onClose();
        }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, flat, idx, onClose]);
  if (!open) return null;
  let running = -1;
  const mono = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--data-settings)'
  };
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose && onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 'var(--z-palette)',
      background: 'rgba(36,24,18,.38)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '12vh 20px 20px',
      animation: 'coffeeos-fade var(--dur) var(--ease)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    style: {
      width: 560,
      maxWidth: '100%',
      maxHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-modal)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 14px',
      height: 48,
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--ink-subtle)",
    strokeWidth: "1.6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 21l-4-4"
  })), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    value: q,
    onChange: e => {
      setQ(e.target.value);
      setIdx(0);
    },
    placeholder: placeholder,
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body-lg)',
      color: 'var(--ink)'
    }
  }), /*#__PURE__*/React.createElement("kbd", {
    style: {
      ...mono,
      fontSize: 'var(--fs-overline)',
      color: 'var(--ink-subtle)',
      border: '1px solid var(--hairline-strong)',
      borderRadius: 'var(--r-sm)',
      padding: '1px 5px'
    }
  }, "ESC")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: 'auto',
      padding: '6px'
    }
  }, filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px',
      textAlign: 'center',
      color: 'var(--ink-muted)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body)'
    }
  }, "No matches for \u201C", q, "\u201D."), filtered.map((g, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi,
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 10px 4px',
      fontFamily: 'var(--font-mono)',
      fontVariationSettings: 'var(--overline-settings)',
      fontWeight: 'var(--overline-weight)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--overline-tracking)',
      fontSize: 'var(--fs-overline)',
      color: 'var(--ink-subtle)'
    }
  }, g.group), g.items.map(it => {
    running++;
    const active = running === idx;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onMouseEnter: () => setIdx(flat.indexOf(it)),
      onClick: () => {
        it.onSelect && it.onSelect();
        onClose && onClose();
      },
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        border: 'none',
        borderRadius: 'var(--r-sm)',
        cursor: 'pointer',
        textAlign: 'left',
        background: active ? 'var(--brand-soft)' : 'transparent',
        color: active ? 'var(--brand-hover)' : 'var(--ink)',
        transition: 'background var(--motion)'
      }
    }, it.icon && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        flex: 'none',
        color: active ? 'var(--brand)' : 'var(--ink-muted)'
      }
    }, React.cloneElement(it.icon, {
      width: 16,
      height: 16
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)'
      }
    }, it.label), it.hint && /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--fs-caption)',
        color: 'var(--ink-subtle)'
      }
    }, it.hint), it.kbd && /*#__PURE__*/React.createElement("kbd", {
      style: {
        ...mono,
        fontSize: 'var(--fs-overline)',
        color: 'var(--ink-muted)',
        background: 'var(--surface-sunken)',
        border: '1px solid var(--hairline-strong)',
        borderRadius: 'var(--r-sm)',
        padding: '1px 5px'
      }
    }, it.kbd));
  }))))), /*#__PURE__*/React.createElement("style", null, `@keyframes coffeeos-fade{from{opacity:0}to{opacity:1}}`));
}
Object.assign(__ds_scope, { CommandPalette });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/CommandPalette.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StepStrip.jsx
try { (() => {
/* CoffeeOS StepStrip — numbered steps for a multi-step task flow, shown at the
   top of a screen. States: done (ink check), current (brand), upcoming (muted).
   steps: [{label,hint}] */
function StepStrip({
  steps = [],
  current = 0,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 0,
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-md)',
      padding: '4px',
      ...style
    }
  }, steps.map((s, i) => {
    const done = i < current,
      cur = i === current;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 'var(--r-sm)',
        background: cur ? 'var(--brand-soft)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        flex: 'none',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontVariationSettings: 'var(--data-settings)',
        fontSize: 12,
        fontWeight: 500,
        background: done ? 'var(--action)' : cur ? 'var(--brand)' : 'var(--surface-sunken)',
        color: done || cur ? '#fff' : 'var(--ink-subtle)',
        border: done || cur ? 'none' : '1px solid var(--hairline-strong)'
      }
    }, done ? /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6L9 17l-5-5"
    })) : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        lineHeight: 1.25,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-label)',
        fontWeight: cur ? 'var(--fw-medium)' : 'var(--fw-regular)',
        color: done || cur ? 'var(--ink)' : 'var(--ink-muted)'
      }
    }, s.label), s.hint && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-caption)',
        color: 'var(--ink-subtle)'
      }
    }, s.hint))), i < steps.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        alignSelf: 'stretch',
        margin: '8px 0',
        background: 'var(--hairline)'
      }
    }));
  }));
}
Object.assign(__ds_scope, { StepStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StepStrip.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/* CoffeeOS Tabs — underline tabs with a brand active indicator.
   tabs: [{value,label,count}] */
function Tabs({
  tabs = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--hairline)',
      ...style
    }
  }, tabs.map(t => {
    const on = t.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(t.value),
      style: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '10px 12px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        fontWeight: on ? 'var(--fw-medium)' : 'var(--fw-regular)',
        color: on ? 'var(--ink)' : 'var(--ink-muted)',
        transition: 'color var(--motion)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.color = 'var(--ink)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.color = 'var(--ink-muted)';
      }
    }, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontVariationSettings: 'var(--data-settings)',
        fontVariantNumeric: 'tabular-nums',
        fontSize: 'var(--fs-overline)',
        padding: '1px 6px',
        borderRadius: 'var(--r-pill)',
        background: on ? 'var(--brand-soft)' : 'var(--surface-sunken)',
        color: on ? 'var(--brand-hover)' : 'var(--ink-muted)'
      }
    }, t.count), on && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        background: 'var(--brand)',
        borderRadius: 2
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Wordmark.jsx
try { (() => {
/* CoffeeOS Wordmark — type stand-in for the (undelivered) logo. Heavy expanded
   Archivo with a single red glyph. Replace with the real mark when supplied. */
function Wordmark({
  compact = false,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: 'var(--display-settings)',
      fontWeight: 'var(--display-weight)',
      letterSpacing: '-0.01em',
      fontSize: 18,
      lineHeight: 1,
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'baseline',
      ...style
    }
  }, compact ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brand)'
    }
  }, "C") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "Coffee"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brand)'
    }
  }, "OS")));
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppShell.jsx
try { (() => {
/* CoffeeOS AppShell — left nav on white (hairline right border), condensed-mono
   OVERLINE group labels, red active indicator + icon, collapse toggle + product
   switcher. Top bar: breadcrumbs, a ⌘K search trigger, and account/cart slots.
   The live BatchStrip mounts directly beneath the top bar (pass `batchStrip`). */
function Chevron({
  dir = 'down',
  size = 15
}) {
  const d = {
    down: 'M6 9l6 6 6-6',
    up: 'M18 15l-6-6-6 6',
    left: 'M15 18l-6-6 6-6',
    right: 'M9 18l6-6-6-6'
  }[dir];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: d
  }));
}
const overline = {
  fontFamily: 'var(--font-mono)',
  fontVariationSettings: 'var(--overline-settings)',
  fontWeight: 'var(--overline-weight)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--overline-tracking)',
  fontSize: 'var(--fs-overline)'
};
const mono = {
  fontFamily: 'var(--font-mono)',
  fontVariationSettings: 'var(--data-settings)',
  fontVariantNumeric: 'tabular-nums'
};
function AppShell({
  product = 'Roasting',
  nav = [],
  activeId,
  onNavigate,
  breadcrumbs = [],
  onOpenPalette,
  searchPlaceholder = 'Search',
  actions,
  batchStrip,
  collapsed = false,
  onToggleCollapse,
  children
}) {
  const W = collapsed ? 'var(--nav-w-collapsed)' : 'var(--nav-w)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `${W} 1fr`,
      minHeight: '100vh',
      background: 'var(--canvas)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--ink)',
      transition: 'grid-template-columns var(--motion)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      background: 'var(--surface)',
      borderRight: '1px solid var(--hairline)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'var(--topbar-h)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      padding: collapsed ? 0 : '0 16px',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Wordmark, {
    compact: collapsed
  })), !collapsed && /*#__PURE__*/React.createElement("button", {
    style: {
      margin: '12px 12px 4px',
      padding: '7px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-md)',
      cursor: 'pointer',
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...overline,
      color: 'var(--ink-subtle)'
    }
  }, "Product"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-label)',
      fontWeight: 'var(--fw-medium)'
    }
  }, product)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-muted)'
    }
  }, /*#__PURE__*/React.createElement(Chevron, {
    dir: "down"
  }))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px 12px'
    }
  }, nav.map((g, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi,
    style: {
      marginBottom: 16
    }
  }, !collapsed && g.group && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 8px 6px',
      ...overline,
      color: 'var(--ink-muted)'
    }
  }, g.group), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, g.items.map(it => {
    const on = it.id === activeId;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      title: collapsed ? it.label : undefined,
      onClick: () => onNavigate && onNavigate(it.id),
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '9px 0' : '7px 10px',
        border: 'none',
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        textAlign: 'left',
        background: on ? 'var(--brand-soft)' : 'transparent',
        color: on ? 'var(--brand-hover)' : 'var(--ink-muted)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        fontWeight: on ? 'var(--fw-medium)' : 'var(--fw-regular)',
        transition: 'background var(--motion),color var(--motion)'
      },
      onMouseEnter: e => {
        if (!on) {
          e.currentTarget.style.background = 'var(--surface-sunken)';
          e.currentTarget.style.color = 'var(--ink)';
        }
      },
      onMouseLeave: e => {
        if (!on) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--ink-muted)';
        }
      }
    }, on && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        top: 6,
        bottom: 6,
        width: 3,
        borderRadius: 3,
        background: 'var(--brand)'
      }
    }), it.icon && /*#__PURE__*/React.createElement("span", {
      style: {
        color: on ? 'var(--brand)' : 'inherit',
        display: 'flex',
        flex: 'none'
      }
    }, React.cloneElement(it.icon, {
      width: 18,
      height: 18
    })), !collapsed && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, it.label), !collapsed && it.badge != null && /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--fs-overline)',
        padding: '0 6px',
        borderRadius: 'var(--r-pill)',
        background: on ? 'var(--brand)' : 'var(--surface-sunken)',
        color: on ? '#fff' : 'var(--ink-muted)'
      }
    }, it.badge));
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: onToggleCollapse,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      justifyContent: collapsed ? 'center' : 'flex-start',
      padding: '11px 16px',
      borderTop: '1px solid var(--hairline)',
      background: 'var(--surface)',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-muted)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-label)'
    }
  }, /*#__PURE__*/React.createElement(Chevron, {
    dir: collapsed ? 'right' : 'left'
  }), !collapsed && /*#__PURE__*/React.createElement("span", null, "Collapse"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--topbar-h)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 24px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--hairline)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb",
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 'var(--fs-label)',
      overflow: 'hidden'
    }
  }, breadcrumbs.map((b, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap'
    }
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-subtle)'
    }
  }, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: i === breadcrumbs.length - 1 ? 'var(--ink)' : 'var(--ink-muted)',
      fontWeight: i === breadcrumbs.length - 1 ? 'var(--fw-medium)' : 'var(--fw-regular)'
    }
  }, b.label)))), /*#__PURE__*/React.createElement("button", {
    onClick: onOpenPalette,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: 260,
      maxWidth: '30vw',
      height: 34,
      padding: '0 8px 0 10px',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-md)',
      cursor: 'pointer',
      color: 'var(--ink-subtle)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 21l-4-4"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-label)'
    }
  }, searchPlaceholder), /*#__PURE__*/React.createElement("kbd", {
    style: {
      ...mono,
      fontSize: 'var(--fs-overline)',
      color: 'var(--ink-muted)',
      background: 'var(--surface)',
      border: '1px solid var(--hairline-strong)',
      borderRadius: 'var(--r-sm)',
      padding: '1px 5px'
    }
  }, "\u2318K")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, actions)), batchStrip, /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'auto'
    }
  }, children)));
}
Object.assign(__ds_scope, { AppShell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/orders/OrdersScreen.jsx
try { (() => {
/* CoffeeOS — Orders resource-list dashboard (worksheet layout). Composes the
   design-system primitives: AppShell + BatchStrip + CommandPalette, HeroMetric +
   StatStrip (never a KPI-card row), Tabs, a bordered filter bar, and an
   edge-to-edge DataTable with hover row actions and a sliding bulk bar.
   Registers window.OrdersScreen. */
(function () {
  const DS = window.CoffeeOSDesignSystem_372546;
  const {
    AppShell,
    BatchStrip,
    CommandPalette,
    HeroMetric,
    StatStrip,
    DataTable,
    Tabs,
    SegmentedControl,
    Badge,
    RoastDot,
    RoastMeter,
    Button,
    IconButton,
    Input,
    Select,
    Toast,
    ToastViewport,
    EmptyState,
    Kbd
  } = DS;
  const {
    Icon
  } = window.CoffeeIcons;
  const ic = n => /*#__PURE__*/React.createElement(Icon, {
    name: n
  });
  const mono = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--data-settings)',
    fontVariantNumeric: 'tabular-nums'
  };
  const overline = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--overline-settings)',
    fontWeight: 'var(--overline-weight)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--overline-tracking)'
  };
  const NAV = [{
    group: 'Workspace',
    items: [{
      id: 'orders',
      label: 'Orders',
      icon: ic('package'),
      badge: 12
    }, {
      id: 'batches',
      label: 'Batches',
      icon: ic('flame')
    }, {
      id: 'wholesale',
      label: 'Wholesale',
      icon: ic('truck')
    }]
  }, {
    group: 'Resources',
    items: [{
      id: 'inventory',
      label: 'Green inventory',
      icon: ic('layers')
    }, {
      id: 'products',
      label: 'Products',
      icon: ic('tag')
    }, {
      id: 'market',
      label: 'Marketplace',
      icon: ic('store')
    }]
  }];
  const QUEUE = [{
    id: 'BR-07',
    roast: 2,
    start: '09:10',
    drop: '09:22',
    status: 'done'
  }, {
    id: 'BR-08',
    roast: 3,
    start: '10:05',
    drop: '10:19',
    status: 'done'
  }, {
    id: 'BR-09',
    roast: 4,
    start: '12:58',
    drop: '13:16',
    status: 'roasting'
  }, {
    id: 'BR-10',
    roast: 1,
    start: '13:40',
    drop: '13:52',
    status: 'queued'
  }, {
    id: 'BR-11',
    roast: 5,
    start: '14:08',
    drop: '14:20',
    status: 'queued'
  }];
  const ORDERS = [{
    id: '#4821',
    channel: 'DTC',
    customer: 'Aya Tanaka',
    roast: 2,
    items: 2,
    total: '$48.00',
    status: 'open',
    date: 'Jul 22'
  }, {
    id: '#4820',
    channel: 'Wholesale',
    customer: 'Rook & Vine Café',
    roast: 4,
    items: 24,
    total: '$612.00',
    status: 'roasting',
    date: 'Jul 22'
  }, {
    id: '#4819',
    channel: 'DTC',
    customer: 'Marcus Bell',
    roast: 3,
    items: 1,
    total: '$21.00',
    status: 'open',
    date: 'Jul 21'
  }, {
    id: '#4818',
    channel: 'Wholesale',
    customer: 'North Pier Roasters',
    roast: 5,
    items: 40,
    total: '$980.00',
    status: 'fulfilled',
    date: 'Jul 21'
  }, {
    id: '#4817',
    channel: 'DTC',
    customer: 'Priya Nair',
    roast: 3,
    items: 3,
    total: '$63.50',
    status: 'fulfilled',
    date: 'Jul 20'
  }, {
    id: '#4816',
    channel: 'DTC',
    customer: 'Sam Okafor',
    roast: 1,
    items: 2,
    total: '$44.00',
    status: 'fulfilled',
    date: 'Jul 20'
  }, {
    id: '#4815',
    channel: 'Wholesale',
    customer: 'Halden Coffee Bar',
    roast: 4,
    items: 18,
    total: '$451.00',
    status: 'cancelled',
    date: 'Jul 19'
  }];
  const STATUS = {
    open: {
      tone: 'warning',
      label: 'Open'
    },
    roasting: {
      tone: 'brand',
      label: 'Roasting',
      pulse: true
    },
    fulfilled: {
      tone: 'success',
      label: 'Fulfilled'
    },
    cancelled: {
      tone: 'neutral',
      label: 'Cancelled'
    }
  };
  function OrdersScreen() {
    const [collapsed, setCollapsed] = React.useState(false);
    const [stripCollapsed, setStripCollapsed] = React.useState(false);
    const [tab, setTab] = React.useState('open');
    const [channel, setChannel] = React.useState('all');
    const [q, setQ] = React.useState('');
    const [sort, setSort] = React.useState({
      key: 'id',
      dir: 'desc'
    });
    const [sel, setSel] = React.useState([]);
    const [toast, setToast] = React.useState(null);
    const [palette, setPalette] = React.useState(false);
    React.useEffect(() => {
      const h = e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setPalette(true);
        }
      };
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, []);
    let rows = ORDERS.filter(o => tab === 'all' ? true : tab === 'open' ? o.status === 'open' || o.status === 'roasting' : o.status === tab).filter(o => channel === 'all' ? true : o.channel.toLowerCase() === channel).filter(o => !q || o.customer.toLowerCase().includes(q.toLowerCase()) || o.id.includes(q));
    rows = [...rows].sort((a, b) => {
      const d = sort.dir === 'asc' ? 1 : -1;
      return a[sort.key] > b[sort.key] ? d : -d;
    });
    const cols = [{
      key: 'id',
      header: 'Order',
      mono: true,
      sortable: true,
      width: 88
    }, {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: (v, r) => /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1.25
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 500
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          ...overline,
          fontSize: 'var(--fs-overline)',
          color: 'var(--ink-subtle)'
        }
      }, r.channel))
    }, {
      key: 'roast',
      header: 'Roast',
      width: 70,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7
        }
      }, /*#__PURE__*/React.createElement(RoastDot, {
        level: v
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          ...mono,
          fontSize: 'var(--fs-overline)',
          color: 'var(--ink-muted)'
        }
      }, v, "/5"))
    }, {
      key: 'items',
      header: 'Items',
      mono: true,
      align: 'right',
      sortable: true,
      width: 64
    }, {
      key: 'total',
      header: 'Total',
      mono: true,
      align: 'right',
      sortable: true,
      width: 96
    }, {
      key: 'status',
      header: 'Status',
      width: 120,
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: STATUS[v].tone,
        dot: true,
        pulse: STATUS[v].pulse
      }, STATUS[v].label)
    }, {
      key: 'date',
      header: 'Date',
      mono: true,
      align: 'right',
      width: 76
    }];
    const counts = {
      open: ORDERS.filter(o => o.status === 'open' || o.status === 'roasting').length,
      fulfilled: ORDERS.filter(o => o.status === 'fulfilled').length
    };
    const paletteGroups = [{
      group: 'Jump to',
      items: [{
        id: 'o4821',
        label: 'Order #4821 — Aya Tanaka',
        hint: 'DTC',
        icon: ic('package'),
        onSelect: () => {}
      }, {
        id: 'br09',
        label: 'Batch BR-09 — Colombia Huila',
        hint: 'roasting',
        icon: ic('flame'),
        onSelect: () => {}
      }, {
        id: 'lot',
        label: 'Lot LOT-2411',
        hint: 'green',
        icon: ic('layers'),
        onSelect: () => {}
      }]
    }, {
      group: 'Actions',
      items: [{
        id: 'create',
        label: 'Create order',
        kbd: 'C',
        icon: ic('plus'),
        onSelect: () => setToast('New order started.')
      }, {
        id: 'start',
        label: 'Start batch',
        kbd: 'B',
        icon: ic('flame'),
        onSelect: () => {}
      }, {
        id: 'export',
        label: 'Export orders (CSV)',
        icon: ic('download'),
        onSelect: () => {}
      }]
    }];
    return /*#__PURE__*/React.createElement(AppShell, {
      product: "Roasting",
      activeId: "orders",
      onNavigate: () => {},
      nav: NAV,
      collapsed: collapsed,
      onToggleCollapse: () => setCollapsed(c => !c),
      onOpenPalette: () => setPalette(true),
      breadcrumbs: [{
        label: 'Roasting'
      }, {
        label: 'Orders'
      }],
      batchStrip: /*#__PURE__*/React.createElement(BatchStrip, {
        batches: QUEUE,
        now: "13:10",
        collapsed: stripCollapsed,
        onToggle: () => setStripCollapsed(c => !c)
      }),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
        icon: ic('bell'),
        "aria-label": "Notifications"
      }), /*#__PURE__*/React.createElement(IconButton, {
        icon: ic('cart'),
        "aria-label": "Cart"
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 24,
          background: 'var(--hairline)',
          margin: '0 4px'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 30,
          height: 30,
          borderRadius: 'var(--r-md)',
          background: 'var(--brand-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-hover)',
          ...mono,
          fontSize: 'var(--fs-caption)',
          fontWeight: 500
        }
      }, "JR"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--content-max)',
        margin: '0 auto',
        padding: '24px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: 'var(--font-display)',
        fontVariationSettings: 'var(--display-settings)',
        fontWeight: 'var(--display-weight)',
        letterSpacing: 'var(--display-tracking)',
        fontSize: 'var(--fs-display)',
        textTransform: 'uppercase',
        color: 'var(--ink)'
      }
    }, "Orders"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        color: 'var(--ink-muted)',
        marginTop: 6
      }
    }, "Accept, roast, and fulfill orders across DTC and wholesale.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: ic('download')
    }, "Export"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: ic('plus')
    }, "Create order"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        alignItems: 'end',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '0 0 260px'
      }
    }, /*#__PURE__*/React.createElement(HeroMetric, {
      label: "Open orders",
      value: "12",
      delta: "+3",
      note: "awaiting action today"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '1 1 480px',
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(StatStrip, {
      stats: [{
        label: 'Revenue · 30d',
        value: '23,840',
        unit: 'USD',
        delta: '+4.2%'
      }, {
        label: 'Fulfillment',
        value: '96.4',
        unit: '%',
        delta: '-0.8%',
        deltaDir: 'down'
      }, {
        label: 'Roasting now',
        value: '1',
        tone: 'live'
      }, {
        label: 'Avg roast queue',
        value: '2.1',
        unit: 'days',
        delta: '-0.3',
        deltaDir: 'down'
      }]
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: t => {
        setTab(t);
        setSel([]);
      },
      tabs: [{
        value: 'open',
        label: 'Open',
        count: counts.open
      }, {
        value: 'fulfilled',
        label: 'Fulfilled',
        count: counts.fulfilled
      }, {
        value: 'all',
        label: 'All'
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 10,
        background: 'var(--surface-sunken)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-md)',
        marginBottom: 16,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '1 1 220px',
        minWidth: 180,
        maxWidth: 300
      }
    }, /*#__PURE__*/React.createElement(Input, {
      size: "sm",
      mono: true,
      leading: /*#__PURE__*/React.createElement(Icon, {
        name: "search"
      }),
      placeholder: "Order # or customer",
      value: q,
      onChange: e => setQ(e.target.value)
    })), /*#__PURE__*/React.createElement(SegmentedControl, {
      size: "sm",
      value: channel,
      onChange: setChannel,
      options: [{
        value: 'all',
        label: 'All'
      }, {
        value: 'dtc',
        label: 'DTC'
      }, {
        value: 'wholesale',
        label: 'Wholesale'
      }]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 140
      }
    }, /*#__PURE__*/React.createElement(Select, {
      size: "sm",
      defaultValue: ""
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Any roast"), /*#__PURE__*/React.createElement("option", null, "Light"), /*#__PURE__*/React.createElement("option", null, "Medium"), /*#__PURE__*/React.createElement("option", null, "Dark"))), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "tertiary",
      iconLeft: ic('sliders')
    }, "More filters")), rows.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "package"
      }),
      title: "No orders match",
      description: "Try clearing the search or switching channels to see more orders.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => {
          setQ('');
          setChannel('all');
          setTab('all');
        }
      }, "Clear filters")
    }) : /*#__PURE__*/React.createElement(DataTable, {
      columns: cols,
      rows: rows,
      selectable: true,
      selectedKeys: sel,
      onSelectionChange: setSel,
      sort: sort,
      onSortChange: setSort,
      stickyTop: 0,
      rowActions: r => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
        size: "sm",
        icon: ic('check'),
        "aria-label": "Mark fulfilled",
        onClick: () => setToast('Order ' + r.id + ' fulfilled.')
      }), /*#__PURE__*/React.createElement(IconButton, {
        size: "sm",
        icon: ic('more'),
        "aria-label": "More actions"
      })),
      bulkActions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconLeft: ic('check'),
        onClick: () => {
          setToast(sel.length + ' orders marked fulfilled.');
          setSel([]);
        }
      }, "Mark fulfilled"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconLeft: ic('printer')
      }, "Print labels"))
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--fs-caption)',
        color: 'var(--ink-muted)'
      }
    }, rows.length, " of ", ORDERS.length, " orders \xB7 ", /*#__PURE__*/React.createElement(Kbd, null, "\u2318K"), " to jump"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: ic('chevronLeft'),
      disabled: true
    }, "Prev"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconRight: ic('chevronRight')
    }, "Next")))), /*#__PURE__*/React.createElement(CommandPalette, {
      open: palette,
      onClose: () => setPalette(false),
      groups: paletteGroups
    }), toast && /*#__PURE__*/React.createElement(ToastViewport, null, /*#__PURE__*/React.createElement(Toast, {
      tone: "success",
      title: toast,
      onDismiss: () => setToast(null)
    })));
  }
  window.OrdersScreen = OrdersScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/orders/OrdersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/roast-batch/RoastBatchScreen.jsx
try { (() => {
/* CoffeeOS — Roast / batch detail (worksheet layout). Live timer + temps as a
   hero + stat strip, a roast-curve chart (viz drawn from the ramp with the live
   bean-temp series in brand), lot traceability as a ruled mono spec table, and
   the roast meter. Composes design-system primitives. Registers window.RoastBatchScreen. */
(function () {
  const DS = window.CoffeeOSDesignSystem_372546;
  const {
    AppShell,
    BatchStrip,
    CommandPalette,
    StepStrip,
    HeroMetric,
    StatStrip,
    RoastMeter,
    Badge,
    Button,
    IconButton,
    InlineBanner,
    Kbd
  } = DS;
  const {
    Icon
  } = window.CoffeeIcons;
  const ic = n => /*#__PURE__*/React.createElement(Icon, {
    name: n
  });
  const mono = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--data-settings)',
    fontVariantNumeric: 'tabular-nums'
  };
  const overline = {
    fontFamily: 'var(--font-mono)',
    fontVariationSettings: 'var(--overline-settings)',
    fontWeight: 'var(--overline-weight)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--overline-tracking)',
    fontSize: 'var(--fs-overline)'
  };
  const NAV = [{
    group: 'Workspace',
    items: [{
      id: 'orders',
      label: 'Orders',
      icon: ic('package'),
      badge: 12
    }, {
      id: 'batches',
      label: 'Batches',
      icon: ic('flame')
    }, {
      id: 'wholesale',
      label: 'Wholesale',
      icon: ic('truck')
    }]
  }, {
    group: 'Resources',
    items: [{
      id: 'inventory',
      label: 'Green inventory',
      icon: ic('layers')
    }, {
      id: 'products',
      label: 'Products',
      icon: ic('tag')
    }, {
      id: 'market',
      label: 'Marketplace',
      icon: ic('store')
    }]
  }];
  const QUEUE = [{
    id: 'BR-07',
    roast: 2,
    start: '09:10',
    drop: '09:22',
    status: 'done'
  }, {
    id: 'BR-08',
    roast: 3,
    start: '10:05',
    drop: '10:19',
    status: 'done'
  }, {
    id: 'BR-09',
    roast: 4,
    start: '12:58',
    drop: '13:16',
    status: 'roasting'
  }, {
    id: 'BR-10',
    roast: 1,
    start: '13:40',
    drop: '13:52',
    status: 'queued'
  }, {
    id: 'BR-11',
    roast: 5,
    start: '14:08',
    drop: '14:20',
    status: 'queued'
  }];

  /* Roast curve — bean temp (brand = live series) + rate of rise (muted). */
  function RoastCurve() {
    const W = 720,
      H = 240,
      padL = 42,
      padB = 28,
      padT = 14,
      padR = 14;
    const iw = W - padL - padR,
      ih = H - padT - padB;
    const bt = [92, 120, 150, 178, 196, 205, 210, 214];
    const ror = [0, 22, 17, 13, 9, 6, 4, 3];
    const n = bt.length,
      maxT = 230,
      maxR = 25;
    const x = i => padL + i / (n - 1) * iw;
    const yT = v => padT + ih - v / maxT * ih;
    const yR = v => padT + ih - v / maxR * ih;
    const path = (arr, y) => arr.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    const grid = [0, 57.5, 115, 172.5, 230];
    const nowI = 5; // current reading index (live)
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${W} ${H}`,
      width: "100%",
      style: {
        display: 'block'
      },
      role: "img",
      "aria-label": "Roast curve: bean temperature and rate of rise over elapsed minutes"
    }, grid.map((g, i) => /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("line", {
      x1: padL,
      x2: W - padR,
      y1: yT(g),
      y2: yT(g),
      stroke: "var(--viz-grid)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("text", {
      x: padL - 8,
      y: yT(g) + 3,
      textAnchor: "end",
      fill: "var(--viz-axis)",
      style: {
        ...mono,
        fontSize: 10
      }
    }, g, "\xB0"))), bt.map((_, i) => /*#__PURE__*/React.createElement("text", {
      key: i,
      x: x(i),
      y: H - 8,
      textAnchor: "middle",
      fill: "var(--viz-axis)",
      style: {
        ...mono,
        fontSize: 10
      }
    }, i, ":00")), /*#__PURE__*/React.createElement("path", {
      d: path(ror, yR),
      fill: "none",
      stroke: "var(--roast-3)",
      strokeWidth: "1.5",
      strokeDasharray: "4 3"
    }), /*#__PURE__*/React.createElement("path", {
      d: path(bt, yT),
      fill: "none",
      stroke: "var(--viz-highlight)",
      strokeWidth: "2.5"
    }), bt.map((v, i) => /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: x(i),
      cy: yT(v),
      r: i === nowI ? 4 : 2.5,
      fill: "var(--viz-highlight)"
    })), /*#__PURE__*/React.createElement("line", {
      x1: x(6),
      x2: x(6),
      y1: padT,
      y2: padT + ih,
      stroke: "var(--ink-subtle)",
      strokeWidth: "1",
      strokeDasharray: "2 3"
    }));
  }
  function SpecRow({
    label,
    value,
    accent,
    last
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: last ? 'none' : '1px solid var(--hairline)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        color: 'var(--ink-muted)'
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--fs-data)',
        color: accent ? 'var(--brand)' : 'var(--ink)'
      }
    }, value));
  }
  function RoastBatchScreen() {
    const [collapsed, setCollapsed] = React.useState(false);
    const [stripCollapsed, setStripCollapsed] = React.useState(false);
    const [palette, setPalette] = React.useState(false);
    React.useEffect(() => {
      const h = e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setPalette(true);
        }
      };
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, []);
    const paletteGroups = [{
      group: 'Jump to',
      items: [{
        id: 'lot',
        label: 'Lot LOT-2411 — Colombia Huila',
        hint: 'green',
        icon: ic('layers'),
        onSelect: () => {}
      }, {
        id: 'prod',
        label: 'Product — Huila Full City',
        hint: 'DTC',
        icon: ic('tag'),
        onSelect: () => {}
      }]
    }, {
      group: 'Actions',
      items: [{
        id: 'drop',
        label: 'Log drop',
        kbd: 'D',
        icon: ic('check'),
        onSelect: () => {}
      }, {
        id: 'read',
        label: 'Log reading',
        icon: ic('thermometer'),
        onSelect: () => {}
      }]
    }];
    return /*#__PURE__*/React.createElement(AppShell, {
      product: "Roasting",
      activeId: "batches",
      nav: NAV,
      collapsed: collapsed,
      onToggleCollapse: () => setCollapsed(c => !c),
      onOpenPalette: () => setPalette(true),
      breadcrumbs: [{
        label: 'Roasting'
      }, {
        label: 'Batches'
      }, {
        label: 'BR-2411-07'
      }],
      batchStrip: /*#__PURE__*/React.createElement(BatchStrip, {
        batches: QUEUE,
        now: "13:10",
        collapsed: stripCollapsed,
        onToggle: () => setStripCollapsed(c => !c)
      }),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
        icon: ic('bell'),
        "aria-label": "Notifications"
      }), /*#__PURE__*/React.createElement(IconButton, {
        icon: ic('cart'),
        "aria-label": "Cart"
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 24,
          background: 'var(--hairline)',
          margin: '0 4px'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 30,
          height: 30,
          borderRadius: 'var(--r-md)',
          background: 'var(--brand-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-hover)',
          ...mono,
          fontSize: 'var(--fs-caption)',
          fontWeight: 500
        }
      }, "JR"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--content-max)',
        margin: '0 auto',
        padding: '24px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: 'var(--font-display)',
        fontVariationSettings: 'var(--display-settings)',
        fontWeight: 'var(--display-weight)',
        letterSpacing: 'var(--display-tracking)',
        fontSize: 'var(--fs-display)',
        textTransform: 'uppercase',
        color: 'var(--ink)'
      }
    }, "BR-2411-07"), /*#__PURE__*/React.createElement(Badge, {
      tone: "brand",
      dot: true,
      pulse: true
    }, "Roasting")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        color: 'var(--ink-muted)'
      }
    }, "Colombia Huila \xB7 ", /*#__PURE__*/React.createElement("span", {
      style: mono
    }, "LOT-2411"), " \xB7 charged 09:42")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: ic('thermometer')
    }, "Log reading"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: ic('check')
    }, "Log drop"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement(StepStrip, {
      current: 3,
      steps: [{
        label: 'Charge',
        hint: '214°C'
      }, {
        label: 'Drying',
        hint: '4:10'
      }, {
        label: 'Maillard',
        hint: '2:35'
      }, {
        label: 'Development',
        hint: 'in progress'
      }, {
        label: 'Drop & cool'
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        alignItems: 'end',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '0 0 220px'
      }
    }, /*#__PURE__*/React.createElement(HeroMetric, {
      label: "Elapsed",
      value: "07:24",
      note: "development phase"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '1 1 520px',
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(StatStrip, {
      stats: [{
        label: 'Charge temp',
        value: '214',
        unit: '°C'
      }, {
        label: 'Bean temp',
        value: '205',
        unit: '°C',
        tone: 'live'
      }, {
        label: 'Rate of rise',
        value: '4.0',
        unit: '°/min'
      }, {
        label: 'First crack',
        value: '6:10'
      }, {
        label: 'Dev time',
        value: '19.2',
        unit: '%'
      }]
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 24,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-md)',
        background: 'var(--surface)',
        padding: '16px 18px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...overline,
        color: 'var(--ink-muted)'
      }
    }, "Roast curve"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-caption)',
        color: 'var(--ink-muted)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 2,
        background: 'var(--viz-highlight)'
      }
    }), "Bean temp \xB7 live"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-caption)',
        color: 'var(--ink-muted)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 0,
        borderTop: '1.5px dashed var(--roast-3)'
      }
    }), "Rate of rise"))), /*#__PURE__*/React.createElement(RoastCurve, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...overline,
        color: 'var(--ink-muted)'
      }
    }, "Roast target"), /*#__PURE__*/React.createElement(RoastMeter, {
      level: 4,
      size: "lg"
    })), /*#__PURE__*/React.createElement(InlineBanner, {
      tone: "info",
      title: "Development window"
    }, "First crack logged at 6:10. Aim for 18\u201322% development for this profile."))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 32
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...overline,
        color: 'var(--ink-muted)'
      }
    }, "Lot traceability"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: 40,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SpecRow, {
      label: "Lot code",
      value: "LOT-2411"
    }), /*#__PURE__*/React.createElement(SpecRow, {
      label: "Origin",
      value: "Colombia \xB7 Huila"
    }), /*#__PURE__*/React.createElement(SpecRow, {
      label: "Producer",
      value: "Finca La Esperanza"
    }), /*#__PURE__*/React.createElement(SpecRow, {
      label: "Process",
      value: "Washed"
    }), /*#__PURE__*/React.createElement(SpecRow, {
      label: "Green in",
      value: "12.0 kg",
      last: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SpecRow, {
      label: "Agtron (target)",
      value: "55"
    }), /*#__PURE__*/React.createElement(SpecRow, {
      label: "Moisture",
      value: "10.4%"
    }), /*#__PURE__*/React.createElement(SpecRow, {
      label: "Density",
      value: "0.71 g/mL"
    }), /*#__PURE__*/React.createElement(SpecRow, {
      label: "Est. loss",
      value: "15.8%",
      accent: true
    }), /*#__PURE__*/React.createElement(SpecRow, {
      label: "Roasted for",
      value: "Huila Full City \xB7 DTC",
      last: true
    }))))), /*#__PURE__*/React.createElement(CommandPalette, {
      open: palette,
      onClose: () => setPalette(false),
      groups: paletteGroups
    }));
  }
  window.RoastBatchScreen = RoastBatchScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/roast-batch/RoastBatchScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/shared/icons.jsx
try { (() => {
/* CoffeeOS UI-kit icons — path data copied from Lucide (https://lucide.dev, ISC).
   Substitution flag: no proprietary CoffeeOS icon set was provided; Lucide is the
   closest match to the brief's thin-stroke direction. Registers window.CoffeeIcons.
   Not a bundled design-system component (kit-local helper only). */
(function () {
  const P = {
    package: ['m7.5 4.27 9 5.15', 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z', 'M3.3 7 12 12l8.7-5', 'M12 22V12'],
    flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
    layers: ['M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'],
    truck: ['M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2', 'M15 18H9', 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14', {
      c: [17, 18, 2]
    }, {
      c: [7, 18, 2]
    }],
    tag: ['M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z', {
      c: [7.5, 7.5, 0.6],
      fill: true
    }],
    store: ['m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7', 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4', 'M2 7h20', 'M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63l-.94-.83a2 2 0 0 0-2.94 0l-.94.83A2.7 2.7 0 0 1 10 12a2.7 2.7 0 0 1-1.59-.63l-.94-.83a2 2 0 0 0-2.94 0l-.94.83A2 2 0 0 1 2 10V7'],
    gauge: ['m12 14 4-4', 'M3.34 19a10 10 0 1 1 17.32 0'],
    search: [{
      c: [11, 11, 8]
    }, 'm21 21-4.3-4.3'],
    plus: ['M5 12h14', 'M12 5v14'],
    chevronDown: ['m6 9 6 6 6-6'],
    chevronLeft: ['m15 18-6-6 6-6'],
    chevronRight: ['m9 18 6-6-6-6'],
    more: [{
      c: [12, 12, 1],
      fill: true
    }, {
      c: [19, 12, 1],
      fill: true
    }, {
      c: [5, 12, 1],
      fill: true
    }],
    sliders: ['M10 5H3', 'M17 11H3', 'M14 17H3', 'M21 5h-4', 'M21 11h-4', 'M21 17h-7', 'M17 3v4', 'M14 9v4', 'M17 15v4'],
    cart: [{
      c: [8, 21, 1],
      fill: true
    }, {
      c: [19, 21, 1],
      fill: true
    }, 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'],
    user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', {
      c: [12, 7, 4]
    }],
    bell: ['M10.268 21a2 2 0 0 0 3.464 0', 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
    thermometer: ['M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z'],
    clock: [{
      c: [12, 12, 10]
    }, 'M12 6v6l4 2'],
    check: ['M20 6 9 17l-5-5'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    printer: ['M6 9V2h12v7', 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2', 'M6 14h12v8H6z'],
    calendar: ['M8 2v4', 'M16 2v4', {
      r: [3, 4, 18, 18, 2]
    }, 'M3 10h18'],
    arrowLeft: ['m12 19-7-7 7-7', 'M19 12H5'],
    dollar: ['M12 2v20', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
    droplet: ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z']
  };
  function Icon(props) {
    const {
      name,
      size = 18,
      strokeWidth = 1.5,
      style,
      ...rest
    } = props;
    const els = P[name] || [];
    const kids = els.map(function (e, i) {
      if (typeof e === 'string') return React.createElement('path', {
        key: i,
        d: e
      });
      if (e.c) return React.createElement('circle', {
        key: i,
        cx: e.c[0],
        cy: e.c[1],
        r: e.c[2],
        fill: e.fill ? 'currentColor' : 'none',
        stroke: e.fill ? 'none' : 'currentColor'
      });
      if (e.r) return React.createElement('rect', {
        key: i,
        width: e.r[0],
        height: e.r[1],
        x: e.r[2],
        y: e.r[3],
        rx: e.r[4]
      });
      return null;
    });
    return React.createElement('svg', {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: style,
      ...rest
    }, kids);
  }
  window.CoffeeIcons = {
    Icon: Icon,
    names: Object.keys(P)
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/shared/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.BatchCard = __ds_scope.BatchCard;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.HeroMetric = __ds_scope.HeroMetric;

__ds_ns.Kbd = __ds_scope.Kbd;

__ds_ns.RoastMeter = __ds_scope.RoastMeter;

__ds_ns.RoastDot = __ds_scope.RoastDot;

__ds_ns.StatStrip = __ds_scope.StatStrip;

__ds_ns.InlineBanner = __ds_scope.InlineBanner;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.ToastViewport = __ds_scope.ToastViewport;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.AppShell = __ds_scope.AppShell;

__ds_ns.BatchStrip = __ds_scope.BatchStrip;

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.CommandPalette = __ds_scope.CommandPalette;

__ds_ns.StepStrip = __ds_scope.StepStrip;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Wordmark = __ds_scope.Wordmark;

})();
