/* @ds-bundle: {"format":4,"namespace":"CoffeeTechDesignSystem_579fe4","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"RoastChip","sourcePath":"components/data/RoastChip.jsx"},{"name":"Stat","sourcePath":"components/data/Stat.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Avatar","sourcePath":"components/layout/Avatar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"0519686a8d64","components/core/Button.jsx":"051d17ef1c0b","components/core/Card.jsx":"534af8213c0b","components/core/Divider.jsx":"79c5dbd58a4b","components/core/IconButton.jsx":"4693621cd237","components/core/Tabs.jsx":"acf9124c606b","components/core/Tag.jsx":"c4c0a11c01f1","components/data/ProgressBar.jsx":"25e17ff6d5b5","components/data/RoastChip.jsx":"09bb21f29023","components/data/Stat.jsx":"ba644c9b8553","components/data/Table.jsx":"9b61c0fefe62","components/feedback/Alert.jsx":"0f5e0ea0dbc2","components/feedback/Dialog.jsx":"f51a6703a857","components/feedback/EmptyState.jsx":"d279b131a7c5","components/feedback/Toast.jsx":"389ed6f44029","components/feedback/Tooltip.jsx":"b08b1d0d3586","components/forms/Checkbox.jsx":"bce2d7751ef3","components/forms/Input.jsx":"13e9b4010a20","components/forms/Select.jsx":"b32671597656","components/forms/Switch.jsx":"0ad1739f6c90","components/layout/Avatar.jsx":"8dabc1fcd465","ui_kits/coffee-ops/batch.jsx":"177eb7c7da09","ui_kits/coffee-ops/gallery.jsx":"8492cde2d58e","ui_kits/coffee-ops/orders.jsx":"135a26699274","ui_kits/coffee-ops/shell.jsx":"e5b1cdcfec8f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CoffeeTechDesignSystem_579fe4 = window.CoffeeTechDesignSystem_579fe4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: 'var(--neutral-150)',
    color: 'var(--neutral-700)',
    dot: 'var(--neutral-500)'
  },
  accent: {
    bg: 'var(--accent-soft)',
    color: 'var(--accent-text)',
    dot: 'var(--accent-500)'
  },
  success: {
    bg: 'var(--success-soft)',
    color: 'var(--success-text)',
    dot: 'var(--success)'
  },
  warning: {
    bg: 'var(--warning-soft)',
    color: 'var(--warning-text)',
    dot: 'var(--warning)'
  },
  danger: {
    bg: 'var(--danger-soft)',
    color: 'var(--danger-text)',
    dot: 'var(--danger)'
  },
  info: {
    bg: 'var(--info-soft)',
    color: 'var(--info-text)',
    dot: 'var(--info)'
  }
};
function Badge({
  tone = 'neutral',
  dot = false,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: 20,
      padding: '0 8px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1,
      color: t.color,
      background: t.bg,
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      ...style
    }
  }), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: t.dot
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    height: 'var(--control-sm)',
    padding: '0 12px',
    font: 'var(--text-sm)',
    gap: 6
  },
  md: {
    height: 'var(--control-md)',
    padding: '0 16px',
    font: 'var(--text-md)',
    gap: 8
  },
  lg: {
    height: 'var(--control-lg)',
    padding: '0 22px',
    font: 'var(--text-lg)',
    gap: 8
  }
};
const VARIANTS = {
  primary: {
    bg: 'var(--brand)',
    bgHover: 'var(--brand-hover)',
    color: 'var(--text-inverse)',
    border: 'transparent'
  },
  accent: {
    bg: 'var(--accent)',
    bgHover: 'var(--accent-hover)',
    color: 'var(--neutral-900)',
    border: 'transparent'
  },
  secondary: {
    bg: 'var(--surface-card)',
    bgHover: 'var(--surface-hover)',
    color: 'var(--text-primary)',
    border: 'var(--border-default)'
  },
  ghost: {
    bg: 'transparent',
    bgHover: 'var(--surface-hover)',
    color: 'var(--text-primary)',
    border: 'transparent'
  },
  danger: {
    bg: 'var(--danger)',
    bgHover: 'var(--red-700)',
    color: '#fff',
    border: 'transparent'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  disabled,
  children,
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    disabled: disabled,
    onMouseEnter: e => {
      setHover(true);
      rest.onMouseEnter?.(e);
    },
    onMouseLeave: e => {
      setHover(false);
      setPress(false);
      rest.onMouseLeave?.(e);
    },
    onMouseDown: e => {
      setPress(true);
      rest.onMouseDown?.(e);
    },
    onMouseUp: e => {
      setPress(false);
      rest.onMouseUp?.(e);
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-body)',
      fontSize: s.font,
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-snug)',
      lineHeight: 1,
      color: disabled ? 'var(--text-disabled)' : v.color,
      background: disabled ? 'var(--surface-sunken)' : hover ? v.bgHover : v.bg,
      border: `1px solid ${disabled ? 'var(--border-subtle)' : v.border}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: (variant === 'primary' || variant === 'accent' || variant === 'danger') && !disabled ? 'var(--shadow-xs)' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transform: press && !disabled ? 'translateY(1px)' : 'none',
      transition: 'background var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      ...style
    }
  }), leftIcon, children, rightIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  interactive = false,
  padding = 20,
  header,
  footer,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    onMouseEnter: e => {
      setHover(true);
      rest.onMouseEnter?.(e);
    },
    onMouseLeave: e => {
      setHover(false);
      rest.onMouseLeave?.(e);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: interactive && hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transition: 'box-shadow var(--duration-normal) var(--ease-out), transform var(--duration-normal) var(--ease-out)',
      transform: interactive && hover ? 'translateY(-1px)' : 'none',
      cursor: interactive ? 'pointer' : 'default',
      overflow: 'hidden',
      ...style
    }
  }), header && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `14px ${padding}px`,
      borderBottom: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-lg)',
      color: 'var(--text-primary)'
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      padding
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `14px ${padding}px`,
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--surface-sunken)'
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Divider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Divider({
  orientation = 'horizontal',
  label,
  style,
  ...rest
}) {
  if (orientation === 'vertical') {
    return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
      style: {
        width: 1,
        alignSelf: 'stretch',
        background: 'var(--border-subtle)',
        ...style
      }
    }));
  }
  if (label) {
    return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        ...style
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--border-subtle)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-caps)',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--border-subtle)'
      }
    }));
  }
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      height: 1,
      width: '100%',
      background: 'var(--border-subtle)',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Divider.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 28,
  md: 36,
  lg: 44
};
const ICON = {
  sm: 16,
  md: 18,
  lg: 20
};
function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  disabled,
  children,
  style,
  ...rest
}) {
  const dim = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const solid = variant === 'primary' || variant === 'accent';
  const bg = solid ? variant === 'accent' ? 'var(--accent)' : 'var(--brand)' : hover ? 'var(--surface-hover)' : variant === 'outline' ? 'var(--surface-card)' : 'transparent';
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      padding: 0,
      color: disabled ? 'var(--text-disabled)' : solid ? variant === 'accent' ? 'var(--neutral-900)' : 'var(--text-inverse)' : 'var(--text-secondary)',
      background: disabled ? 'var(--surface-sunken)' : bg,
      border: `1px solid ${variant === 'outline' ? 'var(--border-default)' : 'transparent'}`,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
      ...style
    }
  }), React.isValidElement(children) ? React.cloneElement(children, {
    width: ICON[size],
    height: ICON[size],
    size: ICON[size]
  }) : children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Tabbed navigation. `underline` for page-level sections, `segmented` for compact filters. */
function Tabs({
  tabs = [],
  value,
  onChange,
  variant = 'underline',
  style,
  ...rest
}) {
  const isSeg = variant === 'segmented';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: "tablist",
    style: {
      display: 'inline-flex',
      gap: isSeg ? 2 : 4,
      padding: isSeg ? 3 : 0,
      background: isSeg ? 'var(--panel)' : 'transparent',
      borderRadius: isSeg ? 'var(--radius-md)' : 0,
      borderBottom: isSeg ? 'none' : '1px solid var(--hairline)',
      ...style
    }
  }), tabs.map(t => {
    const on = value === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(t.id),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-md)',
        fontWeight: on ? 600 : 500,
        padding: isSeg ? '5px 12px' : '9px 4px',
        marginBottom: isSeg ? 0 : -1,
        border: 'none',
        background: isSeg && on ? 'var(--surface)' : 'transparent',
        color: on ? isSeg ? 'var(--ink)' : 'var(--accent-text)' : 'var(--text-secondary)',
        borderRadius: isSeg ? 'var(--radius-sm)' : 0,
        borderBottom: isSeg ? 'none' : `2px solid ${on ? 'var(--accent-500)' : 'transparent'}`,
        boxShadow: isSeg && on ? 'var(--shadow-xs)' : 'none',
        transition: 'color var(--duration-normal) var(--ease-out), background var(--duration-normal) var(--ease-out)'
      }
    }, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 600,
        padding: '1px 6px',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--accent-soft)' : 'var(--surface-sunken)',
        color: on ? 'var(--accent-text)' : 'var(--text-tertiary)'
      }
    }, t.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  onRemove,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 24,
      padding: onRemove ? '0 6px 0 10px' : '0 10px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-secondary)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      ...style
    }
  }), children, onRemove && /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    "aria-label": "Remove",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 16,
      height: 16,
      padding: 0,
      border: 'none',
      borderRadius: 'var(--radius-xs)',
      background: hover ? 'var(--surface-active)' : 'transparent',
      color: 'var(--text-tertiary)',
      cursor: 'pointer',
      fontSize: 13,
      lineHeight: 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  accent: 'var(--accent)',
  brand: 'var(--brand)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)'
};
function ProgressBar({
  value = 0,
  max = 100,
  tone = 'accent',
  showValue = false,
  size = 'md',
  label,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const h = size === 'sm' ? 4 : size === 'lg' ? 10 : 6;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)'
    }
  }, Math.round(pct), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: h,
      width: '100%',
      background: 'var(--neutral-200)',
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${pct}%`,
      background: TONES[tone] || TONES.accent,
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--duration-slow) var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/RoastChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LEVELS = {
  light: '14%',
  'medium-light': '34%',
  medium: '54%',
  'medium-dark': '74%',
  dark: '92%'
};

/** Signature roast-level chip: a green->amber->espresso gradient with a marker at the roast point. */
function RoastChip({
  level = 'medium',
  width = 56,
  showLabel = false,
  style,
  ...rest
}) {
  const pos = LEVELS[level] || LEVELS.medium;
  const label = level.replace('-', ' ');
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: 'relative',
      display: 'inline-block',
      width,
      height: 8,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--roast-gradient)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '50%',
      left: pos,
      width: 3,
      height: 14,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-card)',
      boxShadow: '0 0 0 1.5px var(--neutral-900)',
      transform: 'translate(-50%, -50%)'
    }
  })), showLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--text-secondary)',
      textTransform: 'capitalize'
    }
  }, label));
}
Object.assign(__ds_scope, { RoastChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RoastChip.jsx", error: String((e && e.message) || e) }); }

// components/data/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Stat({
  label,
  value,
  unit,
  delta,
  deltaDirection,
  hint,
  style,
  ...rest
}) {
  const up = deltaDirection === 'up';
  const down = deltaDirection === 'down';
  const deltaColor = up ? 'var(--success-text)' : down ? 'var(--danger-text)' : 'var(--text-tertiary)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: '-0.01em',
      color: 'var(--text-primary)',
      lineHeight: 1
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-md)',
      color: 'var(--text-tertiary)'
    }
  }, unit)), (delta != null || hint) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 2
    }
  }, delta != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: deltaColor
    }
  }, up ? '↑' : down ? '↓' : '', " ", delta), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)'
    }
  }, hint)));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Stat.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Table({
  columns = [],
  data = [],
  rowKey,
  onRowClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  const align = a => a === 'right' ? 'right' : a === 'center' ? 'center' : 'left';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--surface-card)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)'
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: align(c.align),
      padding: '10px 16px',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)',
      borderBottom: '1px solid var(--border-subtle)',
      whiteSpace: 'nowrap',
      width: c.width
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, data.map((row, i) => {
    const k = rowKey ? row[rowKey] : i;
    return /*#__PURE__*/React.createElement("tr", {
      key: k,
      onMouseEnter: () => setHover(k),
      onMouseLeave: () => setHover(null),
      onClick: onRowClick ? () => onRowClick(row) : undefined,
      style: {
        background: hover === k ? 'var(--surface-hover)' : 'transparent',
        cursor: onRowClick ? 'pointer' : 'default',
        transition: 'background var(--duration-fast) var(--ease-out)'
      }
    }, columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        textAlign: align(c.align),
        padding: '12px 16px',
        fontSize: 'var(--text-md)',
        color: 'var(--text-primary)',
        borderBottom: i < data.length - 1 ? '1px solid var(--border-subtle)' : 'none',
        fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-body)',
        fontVariantNumeric: c.mono ? 'tabular-nums' : 'normal',
        whiteSpace: 'nowrap'
      }
    }, c.render ? c.render(row[c.key], row) : row[c.key])));
  }))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  info: {
    bg: 'var(--info-soft)',
    border: 'var(--blue-100)',
    icon: 'var(--info)',
    text: 'var(--info-text)'
  },
  success: {
    bg: 'var(--success-soft)',
    border: 'var(--green-100)',
    icon: 'var(--success)',
    text: 'var(--success-text)'
  },
  warning: {
    bg: 'var(--warning-soft)',
    border: 'var(--amber-100)',
    icon: 'var(--warning)',
    text: 'var(--warning-text)'
  },
  danger: {
    bg: 'var(--danger-soft)',
    border: 'var(--red-100)',
    icon: 'var(--danger)',
    text: 'var(--danger-text)'
  }
};
function Alert({
  tone = 'info',
  title,
  icon,
  onDismiss,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: "alert",
    style: {
      display: 'flex',
      gap: 12,
      padding: '12px 14px',
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: 'var(--radius-md)',
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: t.icon,
      flex: 'none',
      marginTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)',
      marginBottom: children ? 2 : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      lineHeight: 1.5
    }
  }, children)), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--text-tertiary)',
      cursor: 'pointer',
      fontSize: 16,
      lineHeight: 1,
      padding: 0,
      flex: 'none'
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  width = 460,
  children
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose?.();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'oklch(0.16 0.011 42 / 0.42)',
      backdropFilter: 'blur(2px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    style: {
      width: '100%',
      maxWidth: width,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      animation: 'ctds-dialog-in var(--duration-normal) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px 0'
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-primary)',
      margin: 0
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      color: 'var(--text-secondary)',
      margin: '6px 0 0',
      lineHeight: 1.5
    }
  }, description)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 22px'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      padding: '14px 22px',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--surface-sunken)'
    }
  }, footer)), /*#__PURE__*/React.createElement("style", null, '@keyframes ctds-dialog-in{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:none}}'));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Empty state: centered prompt for a section with no data yet. Headline in the display face. */
function EmptyState({
  icon,
  title,
  description,
  action,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 6,
      padding: '48px 24px',
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 48,
      marginBottom: 8,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--accent-soft)',
      color: 'var(--accent-600)',
      border: '1px solid var(--accent-border)'
    }
  }, icon), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontOpticalSizing: 'auto',
      fontWeight: 500,
      fontSize: 'var(--text-2xl)',
      letterSpacing: '-0.01em',
      color: 'var(--ink)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 380,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      color: 'var(--muted)',
      lineHeight: 1.5
    }
  }, description), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: 'var(--neutral-500)',
  accent: 'var(--accent-500)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)'
};

/** Transient floating notification. Elevated (shadow) since it sits above content. */
function Toast({
  tone = 'neutral',
  icon,
  title,
  action,
  onDismiss,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 11,
      minWidth: 280,
      maxWidth: 420,
      padding: '12px 14px',
      background: 'var(--surface-card)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      flex: 'none',
      marginTop: 6,
      borderRadius: '50%',
      background: TONES[tone] || TONES.neutral
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted)',
      lineHeight: 1.45,
      marginTop: title ? 2 : 0
    }
  }, children)), action && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none'
    }
  }, action), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--text-tertiary)',
      cursor: 'pointer',
      fontSize: 16,
      lineHeight: 1,
      padding: 0,
      flex: 'none',
      marginTop: -1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  content,
  side = 'top',
  children,
  style
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 6
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: 6
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: 6
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 6
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
      ...pos,
      zIndex: 50,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      background: 'var(--neutral-900)',
      color: 'var(--neutral-50)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      padding: '5px 9px',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-md)'
    }
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  checked,
  label,
  hint,
  disabled,
  onChange,
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
      flex: 'none',
      marginTop: 1,
      background: checked ? 'var(--accent)' : disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-xs)',
      transition: 'background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--neutral-900)",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange
  }, rest, {
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }))), (label || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
      lineHeight: 1.3
    }
  }, label), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)'
    }
  }, hint)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  size = 'md',
  label,
  hint,
  error,
  leadingIcon,
  trailingIcon,
  id,
  disabled,
  style,
  containerStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-sm)' : size === 'lg' ? 'var(--control-lg)' : 'var(--control-md)';
  const rid = id || React.useId();
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: h,
      padding: '0 12px',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring)' : 'none',
      transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)'
    }
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-tertiary)'
    }
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    id: rid,
    disabled: disabled,
    onFocus: e => {
      setFocus(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur?.(e);
    },
    style: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      color: 'var(--text-primary)',
      ...style
    }
  })), trailingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-tertiary)'
    }
  }, trailingIcon)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--danger-text)' : 'var(--text-tertiary)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  size = 'md',
  label,
  hint,
  error,
  options = [],
  placeholder,
  id,
  disabled,
  style,
  containerStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-sm)' : size === 'lg' ? 'var(--control-lg)' : 'var(--control-md)';
  const rid = id || React.useId();
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    id: rid,
    disabled: disabled,
    onFocus: e => {
      setFocus(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur?.(e);
    },
    style: {
      appearance: 'none',
      width: '100%',
      height: h,
      padding: '0 34px 0 12px',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring)' : 'none',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      color: 'var(--text-primary)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
      ...style
    }
  }), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lab = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lab);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 12,
      pointerEvents: 'none',
      color: 'var(--text-tertiary)',
      fontSize: 11
    }
  }, "\u25BE")), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--danger-text)' : 'var(--text-tertiary)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  checked,
  label,
  disabled,
  onChange,
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: 36,
      height: 20,
      flex: 'none',
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--accent)' : 'var(--neutral-300)',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--duration-normal) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? 18 : 2,
      width: 16,
      height: 16,
      background: 'var(--neutral-0)',
      borderRadius: '50%',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--duration-normal) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: onChange
  }, rest, {
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/layout/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48
};
const PALETTE = ['var(--accent-500)', 'var(--blue-500)', 'var(--amber-500)', 'var(--neutral-700)', 'var(--petrol-500)'];
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function Avatar({
  name = '',
  src,
  size = 'md',
  style,
  ...rest
}) {
  const dim = SIZES[size] || SIZES.md;
  const hue = PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flex: 'none',
      borderRadius: '50%',
      overflow: 'hidden',
      background: src ? 'var(--surface-sunken)' : hue,
      color: 'var(--neutral-0)',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: Math.round(dim * 0.4),
      letterSpacing: '0.01em',
      userSelect: 'none',
      border: '1px solid oklch(0 0 0 / 0.06)',
      ...style
    }
  }), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Avatar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coffee-ops/batch.jsx
try { (() => {
// Roast / batch detail view. Exposes window.BatchScreen.
const DSb = window.CoffeeTechDesignSystem_579fe4;

// Bean-temp curve samples: [seconds, °C]
const CURVE = [[0, 120], [25, 96], [80, 88], [150, 112], [240, 142], [330, 163], [420, 179], [500, 191], [540, 196], [600, 203], [660, 208], [705, 211]];
const FIRST_CRACK = 540; // s
const DROP = 705;
function RoastChart() {
  const W = 640,
    H = 260,
    padL = 44,
    padR = 16,
    padT = 16,
    padB = 30;
  const tMax = 720,
    tMin = 0,
    yMax = 220,
    yMin = 80;
  const x = t => padL + (t - tMin) / (tMax - tMin) * (W - padL - padR);
  const y = v => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB);
  const line = CURVE.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(' ');
  const area = `${line} L${x(CURVE[CURVE.length - 1][0]).toFixed(1)} ${H - padB} L${x(0).toFixed(1)} ${H - padB} Z`;
  const yTicks = [100, 140, 180, 220];
  const tTicks = [0, 180, 360, 540, 720];
  const fmtT = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: "100%",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "rg",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "var(--accent-500)",
    stopOpacity: "0.16"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "var(--accent-500)",
    stopOpacity: "0"
  }))), yTicks.map(v => /*#__PURE__*/React.createElement("g", {
    key: v
  }, /*#__PURE__*/React.createElement("line", {
    x1: padL,
    y1: y(v),
    x2: W - padR,
    y2: y(v),
    stroke: "var(--viz-grid)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("text", {
    x: padL - 8,
    y: y(v) + 3,
    textAnchor: "end",
    fontFamily: "var(--font-mono)",
    fontSize: "10",
    fill: "var(--viz-axis)"
  }, v, "\xB0"))), tTicks.map(t => /*#__PURE__*/React.createElement("text", {
    key: t,
    x: x(t),
    y: H - 10,
    textAnchor: "middle",
    fontFamily: "var(--font-mono)",
    fontSize: "10",
    fill: "var(--viz-axis)"
  }, fmtT(t))), /*#__PURE__*/React.createElement("line", {
    x1: x(FIRST_CRACK),
    y1: padT,
    x2: x(FIRST_CRACK),
    y2: H - padB,
    stroke: "var(--amber-500)",
    strokeWidth: "1",
    strokeDasharray: "3 3"
  }), /*#__PURE__*/React.createElement("text", {
    x: x(FIRST_CRACK) + 5,
    y: padT + 11,
    fontFamily: "var(--font-mono)",
    fontSize: "10",
    fontWeight: "600",
    fill: "var(--amber-700)"
  }, "1st crack"), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "url(#rg)"
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: "var(--accent-500)",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: x(DROP),
    cy: y(211),
    r: "4",
    fill: "var(--accent-600)",
    stroke: "var(--surface)",
    strokeWidth: "2"
  }));
}
function MiniStat({
  label,
  value,
  unit,
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 120,
      padding: '12px 14px',
      borderRight: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 4,
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 20,
      fontWeight: 500,
      color: tone || 'var(--ink)'
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, unit)));
}
const EVENTS = [{
  t: '0:00',
  label: 'Charge',
  temp: '204 °C',
  note: 'Drum charged, 9.80 kg green'
}, {
  t: '1:20',
  label: 'Turning point',
  temp: '88 °C',
  note: 'Lowest bean temp'
}, {
  t: '9:00',
  label: 'First crack',
  temp: '196 °C',
  note: 'Airflow +1, gas −2'
}, {
  t: '11:42',
  label: 'Drop',
  temp: '211 °C',
  note: 'Development 2:42 · 23.8%',
  active: true
}];
function Panel({
  title,
  action,
  children,
  pad = true
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '13px 16px',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      margin: 0,
      color: 'var(--ink)'
    }
  }, title), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad ? 16 : 0
    }
  }, children));
}
function LotRow({
  k,
  v
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '9px 0',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 13,
      color: 'var(--ink)'
    }
  }, v));
}
function BatchScreen() {
  const topActions = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DSb.IconButton, {
    variant: "outline",
    label: "Notifications"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "Bell",
    s: 16
  })), /*#__PURE__*/React.createElement(DSb.Button, {
    variant: "primary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "Plus",
      s: 16
    })
  }, "New roast"));
  return /*#__PURE__*/React.createElement(Page, {
    product: "roasting",
    active: "batches",
    topActions: topActions
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '0 auto',
      padding: '20px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "orders.html",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--muted)',
      textDecoration: 'none',
      width: 'fit-content'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "ArrowLeft",
    s: 15
  }), " Batches"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
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
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--muted)'
    }
  }, "#A-2291"), /*#__PURE__*/React.createElement(DSb.Badge, {
    tone: "success",
    dot: true
  }, "Complete")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontOpticalSizing: 'auto',
      fontWeight: 500,
      fontSize: 'var(--text-4xl)',
      letterSpacing: '-0.02em',
      margin: 0,
      color: 'var(--ink)'
    }
  }, "Colombia Huila"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "roast-chip",
    "data-roast": "medium"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--muted)'
    }
  }, "Medium \xB7 washed \xB7 roasted Jul 21, 2026 \xB7 11:42 total"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(DSb.Button, {
    variant: "secondary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "Copy",
      s: 15
    })
  }, "Duplicate"), /*#__PURE__*/React.createElement(DSb.Button, {
    variant: "secondary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "Pencil",
      s: 15
    })
  }, "Edit profile"), /*#__PURE__*/React.createElement(DSb.Button, {
    variant: "primary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "RotateCcw",
      s: 15
    })
  }, "Roast again"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-lg)'
    }
  }, /*#__PURE__*/React.createElement(MiniStat, {
    label: "Green in",
    value: "9.80",
    unit: "kg"
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Roasted out",
    value: "8.30",
    unit: "kg"
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Weight loss",
    value: "15.3",
    unit: "%",
    tone: "var(--amber-700)"
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Dev. time",
    value: "2:42"
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Dev. ratio",
    value: "23.8",
    unit: "%"
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Drop temp",
    value: "211",
    unit: "\xB0C"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
      gap: 18,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Roast curve",
    action: /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 3,
        borderRadius: 2,
        background: 'var(--accent-500)'
      }
    }), "Bean temp"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 0,
        borderTop: '1px dashed var(--amber-500)'
      }
    }), "1st crack"))
  }, /*#__PURE__*/React.createElement(RoastChart, null)), /*#__PURE__*/React.createElement(Panel, {
    title: "Roast log",
    pad: false
  }, /*#__PURE__*/React.createElement("div", null, EVENTS.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 16px',
      borderBottom: i < EVENTS.length - 1 ? '1px solid var(--hairline)' : 'none',
      background: e.active ? 'var(--accent-soft)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--ink)',
      width: 52,
      flex: 'none'
    }
  }, e.t), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      flex: 'none',
      borderRadius: '50%',
      background: e.active ? 'var(--accent-500)' : 'var(--neutral-300)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ink)',
      width: 120,
      flex: 'none'
    }
  }, e.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 13,
      color: 'var(--muted)',
      width: 64,
      flex: 'none'
    }
  }, e.temp), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--muted)',
      flex: 1
    }
  }, e.note)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Green lot"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 17,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, "Huila, Colombia")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(DSb.Tag, null, "Washed"), /*#__PURE__*/React.createElement(DSb.Tag, null, "Caturra"), /*#__PURE__*/React.createElement(DSb.Tag, null, "1,750 masl")), /*#__PURE__*/React.createElement("hr", {
    className: "roast-perf",
    style: {
      margin: '10px 0'
    }
  }), /*#__PURE__*/React.createElement(LotRow, {
    k: "Lot ID",
    v: "LOT-CO-0417"
  }), /*#__PURE__*/React.createElement(LotRow, {
    k: "On hand",
    v: "142 kg"
  }), /*#__PURE__*/React.createElement(LotRow, {
    k: "Cost / kg",
    v: "$8.40"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '9px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--muted)'
    }
  }, "Stock level"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--success-text)'
    }
  }, "Healthy")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(DSb.ProgressBar, {
    value: 62,
    tone: "success"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: "Tasting notes"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 12px',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      lineHeight: 1.55,
      color: 'var(--text-secondary)'
    }
  }, "Red apple and brown sugar up front, milk-chocolate body, clean citrus finish. Best rested 5\u20137 days."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(DSb.Tag, null, "Red apple"), /*#__PURE__*/React.createElement(DSb.Tag, null, "Brown sugar"), /*#__PURE__*/React.createElement(DSb.Tag, null, "Chocolate")))))));
}
Object.assign(window, {
  BatchScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coffee-ops/batch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coffee-ops/gallery.jsx
try { (() => {
// Component gallery — every component in its states. Exposes window.Gallery.
const G = window.CoffeeTechDesignSystem_579fe4;
function GIcon({
  n,
  s = 16,
  color
}) {
  const ref = React.useRef();
  React.useEffect(() => {
    if (ref.current && window.lucide && lucide[n]) {
      ref.current.innerHTML = '';
      const el = lucide.createElement(lucide[n]);
      el.setAttribute('width', s);
      el.setAttribute('height', s);
      ref.current.appendChild(el);
    }
  }, [n, s]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-flex',
      color: color || 'currentColor'
    }
  });
}
function Section({
  id,
  title,
  note,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'grid',
      gridTemplateColumns: '200px 1fr',
      gap: 28,
      padding: '28px 0',
      borderTop: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontOpticalSizing: 'auto',
      fontWeight: 500,
      fontSize: 20,
      letterSpacing: '-0.01em',
      margin: 0,
      color: 'var(--ink)'
    }
  }, title), note && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--muted)',
      lineHeight: 1.45
    }
  }, note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      minWidth: 0
    }
  }, children));
}
function Row({
  children,
  align = 'center'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: align
    }
  }, children);
}
function Field({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      minWidth: 200
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, label), children);
}
function Gallery() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState('all');
  const [seg, setSeg] = React.useState('roast');
  const [chk, setChk] = React.useState(true);
  const [sw, setSw] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1080,
      margin: '0 auto',
      padding: '40px 32px 80px'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 10
    }
  }, "Ledger & Roast \xB7 Component gallery"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontOpticalSizing: 'auto',
      fontWeight: 500,
      fontSize: 'var(--text-5xl)',
      letterSpacing: '-0.02em',
      margin: 0,
      color: 'var(--ink)'
    }
  }, "Components"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      maxWidth: 620,
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--muted)',
      lineHeight: 1.55
    }
  }, "Every primitive in the coffee-ops system, shown in its states. Warm-neutral surfaces, one green accent, mono tabular figures, crisp borders over shadow.")), /*#__PURE__*/React.createElement(Section, {
    title: "Buttons",
    note: "Primary is the espresso brand fill. Accent = the one green CTA. Sizes sm / md / lg."
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.Button, {
    variant: "primary"
  }, "Save changes"), /*#__PURE__*/React.createElement(G.Button, {
    variant: "accent"
  }, "Create order"), /*#__PURE__*/React.createElement(G.Button, {
    variant: "secondary"
  }, "Cancel"), /*#__PURE__*/React.createElement(G.Button, {
    variant: "ghost"
  }, "Filter"), /*#__PURE__*/React.createElement(G.Button, {
    variant: "danger"
  }, "Delete batch"), /*#__PURE__*/React.createElement(G.Button, {
    variant: "primary",
    disabled: true
  }, "Disabled")), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.Button, {
    variant: "secondary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(GIcon, {
      n: "Plus",
      s: 15
    })
  }, "New"), /*#__PURE__*/React.createElement(G.Button, {
    variant: "secondary",
    size: "md",
    leftIcon: /*#__PURE__*/React.createElement(GIcon, {
      n: "Download",
      s: 16
    })
  }, "Export"), /*#__PURE__*/React.createElement(G.Button, {
    variant: "primary",
    size: "lg",
    rightIcon: /*#__PURE__*/React.createElement(GIcon, {
      n: "ArrowRight",
      s: 17
    })
  }, "Continue")), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.IconButton, {
    variant: "outline",
    label: "Search"
  }, /*#__PURE__*/React.createElement(GIcon, {
    n: "Search",
    s: 16
  })), /*#__PURE__*/React.createElement(G.IconButton, {
    variant: "ghost",
    label: "More"
  }, /*#__PURE__*/React.createElement(GIcon, {
    n: "MoreHorizontal",
    s: 16
  })), /*#__PURE__*/React.createElement(G.IconButton, {
    variant: "primary",
    label: "Add"
  }, /*#__PURE__*/React.createElement(GIcon, {
    n: "Plus",
    s: 16
  })), /*#__PURE__*/React.createElement(G.IconButton, {
    variant: "accent",
    label: "Confirm"
  }, /*#__PURE__*/React.createElement(GIcon, {
    n: "Check",
    s: 16
  })))), /*#__PURE__*/React.createElement(Section, {
    title: "Tabs",
    note: "Underline for page sections; segmented for compact filters."
  }, /*#__PURE__*/React.createElement(G.Tabs, {
    variant: "underline",
    value: tab,
    onChange: setTab,
    tabs: [{
      id: 'all',
      label: 'All',
      count: 128
    }, {
      id: 'open',
      label: 'Open',
      count: 6
    }, {
      id: 'ship',
      label: 'To ship'
    }, {
      id: 'done',
      label: 'Fulfilled'
    }]
  }), /*#__PURE__*/React.createElement(G.Tabs, {
    variant: "segmented",
    value: seg,
    onChange: setSeg,
    tabs: [{
      id: 'roast',
      label: 'Roast'
    }, {
      id: 'green',
      label: 'Green'
    }, {
      id: 'sales',
      label: 'Sales'
    }]
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Status & badges",
    note: "Desaturated semantic tones. Add a dot for live status."
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.Badge, {
    tone: "neutral"
  }, "Draft"), /*#__PURE__*/React.createElement(G.Badge, {
    tone: "accent"
  }, "New"), /*#__PURE__*/React.createElement(G.Badge, {
    tone: "success",
    dot: true
  }, "Fulfilled"), /*#__PURE__*/React.createElement(G.Badge, {
    tone: "warning",
    dot: true
  }, "Unfulfilled"), /*#__PURE__*/React.createElement(G.Badge, {
    tone: "danger",
    dot: true
  }, "Failed"), /*#__PURE__*/React.createElement(G.Badge, {
    tone: "info",
    dot: true
  }, "Syncing")), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.Tag, null, "Washed"), /*#__PURE__*/React.createElement(G.Tag, null, "Ethiopia"), /*#__PURE__*/React.createElement(G.Tag, {
    onRemove: () => {}
  }, "Single origin"), /*#__PURE__*/React.createElement(G.Tag, {
    onRemove: () => {}
  }, "Chocolate"))), /*#__PURE__*/React.createElement(Section, {
    title: "Roast-level chip",
    note: "The signature. Green \u2192 amber \u2192 espresso gradient with a marker at the roast point."
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.RoastChip, {
    level: "light",
    showLabel: true
  }), /*#__PURE__*/React.createElement(G.RoastChip, {
    level: "medium-light",
    showLabel: true
  }), /*#__PURE__*/React.createElement(G.RoastChip, {
    level: "medium",
    showLabel: true
  }), /*#__PURE__*/React.createElement(G.RoastChip, {
    level: "medium-dark",
    showLabel: true
  }), /*#__PURE__*/React.createElement(G.RoastChip, {
    level: "dark",
    showLabel: true
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Forms",
    note: "Labels, help text, and validation. Focus shows the green ring."
  }, /*#__PURE__*/React.createElement(Row, {
    align: "flex-start"
  }, /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement(G.Input, {
    label: "Batch name",
    placeholder: "Colombia Huila",
    defaultValue: "Colombia Huila"
  })), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement(G.Input, {
    label: "Green weight",
    placeholder: "0.0",
    defaultValue: "9.80",
    trailingIcon: /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, "kg")
  })), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement(G.Input, {
    label: "Lot ID",
    error: "Lot not found. Check the code and retry.",
    defaultValue: "LOT-XX-9999"
  }))), /*#__PURE__*/React.createElement(Row, {
    align: "flex-start"
  }, /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement(G.Select, {
    label: "Roast profile",
    options: ['City', 'City+', 'Full City', 'Full City+', 'Vienna']
  })), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement(G.Input, {
    label: "Search",
    leadingIcon: /*#__PURE__*/React.createElement(GIcon, {
      n: "Search",
      s: 15
    }),
    placeholder: "Search SKUs\u2026"
  }))), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.Checkbox, {
    checked: chk,
    onChange: () => setChk(v => !v),
    label: "Notify on drop"
  }), /*#__PURE__*/React.createElement(G.Checkbox, {
    checked: false,
    onChange: () => {},
    label: "Auto-tag origin"
  }), /*#__PURE__*/React.createElement(G.Checkbox, {
    checked: false,
    disabled: true,
    label: "Disabled option"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(G.Switch, {
    checked: sw,
    onChange: () => setSw(v => !v)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--ink)'
    }
  }, "Live curve sync")))), /*#__PURE__*/React.createElement(Section, {
    title: "KPI & progress",
    note: "Big Fraunces numeral, mono delta, muted label. Progress bars for stock and capacity."
  }, /*#__PURE__*/React.createElement(Row, {
    align: "stretch"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement(G.Stat, {
    label: "Revenue, 7d",
    value: "8,940",
    unit: "$",
    delta: "6.4%",
    deltaDirection: "up",
    hint: "vs. prev"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement(G.Stat, {
    label: "Weight loss",
    value: "15.3",
    unit: "%",
    delta: "0.4%",
    deltaDirection: "down",
    hint: "target 15%"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement(G.Stat, {
    label: "Batches today",
    value: "12",
    delta: "3",
    deltaDirection: "up",
    hint: "roasted"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 440,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(G.ProgressBar, {
    label: "Green stock \u2014 Huila",
    value: 62,
    tone: "success",
    showValue: true
  }), /*#__PURE__*/React.createElement(G.ProgressBar, {
    label: "Roaster capacity",
    value: 88,
    tone: "warning",
    showValue: true
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Banners & toasts",
    note: "Banners sit inline; toasts float above content with elevation."
  }, /*#__PURE__*/React.createElement(G.Alert, {
    tone: "info",
    title: "Scale firmware update available",
    icon: /*#__PURE__*/React.createElement(GIcon, {
      n: "Info",
      s: 16
    }),
    onDismiss: () => {}
  }, "Version 2.4 improves drop-weight accuracy. Update from Settings."), /*#__PURE__*/React.createElement(G.Alert, {
    tone: "warning",
    title: "2 orders past their ship-by date",
    icon: /*#__PURE__*/React.createElement(GIcon, {
      n: "TriangleAlert",
      s: 16
    })
  }, "Fulfill or reschedule to keep wholesale SLAs."), /*#__PURE__*/React.createElement(G.Alert, {
    tone: "danger",
    title: "Hopper scale disconnected",
    icon: /*#__PURE__*/React.createElement(GIcon, {
      n: "Unplug",
      s: 16
    }),
    onDismiss: () => {}
  }, "Reconnect the scale over USB, then retry the batch."), /*#__PURE__*/React.createElement(Row, {
    align: "flex-start"
  }, /*#__PURE__*/React.createElement(G.Toast, {
    tone: "success",
    title: "Batch logged",
    action: /*#__PURE__*/React.createElement(G.Button, {
      variant: "ghost",
      size: "sm"
    }, "Undo")
  }, "#A-2291 saved \u2014 8.30 kg roasted."), /*#__PURE__*/React.createElement(G.Toast, {
    tone: "accent",
    title: "Export ready",
    onDismiss: () => {}
  }, "Orders_Jul21.csv downloaded."))), /*#__PURE__*/React.createElement(Section, {
    title: "Overlays",
    note: "Modal dialog with an espresso scrim; hover tooltips on a dark surface."
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.Button, {
    variant: "secondary",
    onClick: () => setOpen(true)
  }, "Open dialog"), /*#__PURE__*/React.createElement(G.Tooltip, {
    content: "Roasted Jul 21 \xB7 11:42",
    side: "top"
  }, /*#__PURE__*/React.createElement(G.Button, {
    variant: "ghost"
  }, "Hover for detail")), /*#__PURE__*/React.createElement(G.Tooltip, {
    content: "Wholesale channel",
    side: "right"
  }, /*#__PURE__*/React.createElement(G.Badge, {
    tone: "neutral"
  }, "WS"))), /*#__PURE__*/React.createElement(G.Dialog, {
    open: open,
    onClose: () => setOpen(false),
    title: "Delete batch #A-2291?",
    description: "This removes the roast log and yield figures. Green stock is not affected.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(G.Button, {
      variant: "secondary",
      onClick: () => setOpen(false)
    }, "Keep batch"), /*#__PURE__*/React.createElement(G.Button, {
      variant: "danger",
      onClick: () => setOpen(false)
    }, "Delete batch"))
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Identity & empty states",
    note: "Avatars fall back to warm-tinted initials. Empty states invite the next action."
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(G.Avatar, {
    name: "Ravi Okonkwo",
    size: "lg"
  }), /*#__PURE__*/React.createElement(G.Avatar, {
    name: "Marlow Rivera",
    size: "md"
  }), /*#__PURE__*/React.createElement(G.Avatar, {
    name: "Ana Ferreira",
    size: "sm"
  }), /*#__PURE__*/React.createElement(G.Avatar, {
    name: "Devon Walsh",
    size: "xs"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement(G.EmptyState, {
    icon: /*#__PURE__*/React.createElement(GIcon, {
      n: "ClipboardList",
      s: 22
    }),
    title: "No wholesale orders yet",
    description: "Create your first wholesale order to start tracking fulfillment across accounts.",
    action: /*#__PURE__*/React.createElement(G.Button, {
      variant: "primary",
      leftIcon: /*#__PURE__*/React.createElement(GIcon, {
        n: "Plus",
        s: 15
      })
    }, "Create order")
  }))));
}
Object.assign(window, {
  Gallery
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coffee-ops/gallery.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coffee-ops/orders.jsx
try { (() => {
// Orders resource-list dashboard. Exposes window.OrdersScreen.
const DSo = window.CoffeeTechDesignSystem_579fe4;
const ORDERS = [{
  id: '#1042',
  cust: 'Blue Line Café',
  channel: 'Wholesale',
  items: '3 lots · 24 kg',
  roast: 'medium',
  total: 468.00,
  status: 'unfulfilled',
  statusTone: 'warning',
  statusLabel: 'Unfulfilled',
  date: '2026-07-21',
  paid: true
}, {
  id: '#1041',
  cust: 'Marlow Rivera',
  channel: 'DTC',
  items: '2 bags · 680 g',
  roast: 'light',
  total: 39.50,
  status: 'fulfilled',
  statusTone: 'success',
  statusLabel: 'Fulfilled',
  date: '2026-07-21',
  paid: true
}, {
  id: '#1040',
  cust: 'Sightline Roasters',
  channel: 'Wholesale',
  items: '1 lot · 30 kg',
  roast: 'medium-dark',
  total: 540.00,
  status: 'partial',
  statusTone: 'info',
  statusLabel: 'Partly shipped',
  date: '2026-07-20',
  paid: true
}, {
  id: '#1039',
  cust: 'Ana Ferreira',
  channel: 'DTC',
  items: '1 bag · 340 g',
  roast: 'dark',
  total: 19.00,
  status: 'fulfilled',
  statusTone: 'success',
  statusLabel: 'Fulfilled',
  date: '2026-07-20',
  paid: true
}, {
  id: '#1038',
  cust: 'Corner Post Coffee',
  channel: 'Wholesale',
  items: '4 lots · 40 kg',
  roast: 'medium',
  total: 720.00,
  status: 'unfulfilled',
  statusTone: 'warning',
  statusLabel: 'Unfulfilled',
  date: '2026-07-19',
  paid: false
}, {
  id: '#1037',
  cust: 'Devon Walsh',
  channel: 'DTC',
  items: '3 bags · 1.0 kg',
  roast: 'medium-light',
  total: 58.00,
  status: 'fulfilled',
  statusTone: 'success',
  statusLabel: 'Fulfilled',
  date: '2026-07-19',
  paid: true
}, {
  id: '#1036',
  cust: 'Harbor & Vine',
  channel: 'Wholesale',
  items: '2 lots · 20 kg',
  roast: 'medium-dark',
  total: 360.00,
  status: 'refunded',
  statusTone: 'neutral',
  statusLabel: 'Refunded',
  date: '2026-07-18',
  paid: false
}, {
  id: '#1035',
  cust: 'Priya Nair',
  channel: 'DTC',
  items: '1 bag · 340 g',
  roast: 'light',
  total: 21.00,
  status: 'unfulfilled',
  statusTone: 'warning',
  statusLabel: 'Unfulfilled',
  date: '2026-07-18',
  paid: true
}];
const money = n => '$' + n.toFixed(2);
function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaTone,
  sub
}) {
  const dc = deltaTone === 'down' ? 'var(--danger-text)' : 'var(--success-text)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 180,
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6,
      margin: '8px 0 4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontOpticalSizing: 'auto',
      fontWeight: 500,
      fontSize: 34,
      letterSpacing: '-0.02em',
      color: 'var(--ink)',
      lineHeight: 1
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--muted)'
    }
  }, unit)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 12
    }
  }, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      color: dc,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: deltaTone === 'down' ? 'ArrowDownRight' : 'ArrowUpRight',
    s: 13
  }), delta), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, sub)));
}
const TABS = [{
  id: 'all',
  label: 'All'
}, {
  id: 'unfulfilled',
  label: 'Unfulfilled'
}, {
  id: 'partial',
  label: 'Open'
}, {
  id: 'wholesale',
  label: 'Wholesale'
}, {
  id: 'dtc',
  label: 'DTC'
}];
const COLS = [{
  id: 'id',
  label: 'Order',
  w: '90px',
  num: true
}, {
  id: 'cust',
  label: 'Customer',
  w: 'auto'
}, {
  id: 'channel',
  label: 'Channel',
  w: '110px'
}, {
  id: 'items',
  label: 'Items',
  w: '150px',
  num: true
}, {
  id: 'roast',
  label: 'Roast',
  w: '96px'
}, {
  id: 'total',
  label: 'Total',
  w: '96px',
  num: true,
  right: true
}, {
  id: 'status',
  label: 'Status',
  w: '140px'
}, {
  id: 'date',
  label: 'Date',
  w: '110px',
  num: true
}];
function OrdersScreen() {
  const [tab, setTab] = React.useState('all');
  const [sort, setSort] = React.useState({
    col: 'date',
    dir: 'desc'
  });
  const [sel, setSel] = React.useState(() => new Set());
  const filtered = ORDERS.filter(o => {
    if (tab === 'all') return true;
    if (tab === 'wholesale') return o.channel === 'Wholesale';
    if (tab === 'dtc') return o.channel === 'DTC';
    if (tab === 'partial') return o.status === 'unfulfilled' || o.status === 'partial';
    return o.status === tab;
  });
  const rows = [...filtered].sort((a, b) => {
    const d = sort.dir === 'asc' ? 1 : -1;
    const av = a[sort.col],
      bv = b[sort.col];
    return (av < bv ? -1 : av > bv ? 1 : 0) * d;
  });
  const allSel = rows.length > 0 && rows.every(r => sel.has(r.id));
  const someSel = sel.size > 0;
  const toggleAll = () => setSel(allSel ? new Set() : new Set(rows.map(r => r.id)));
  const toggleOne = id => setSel(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const setSortCol = col => setSort(s => ({
    col,
    dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc'
  }));
  const topActions = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DSo.IconButton, {
    variant: "outline",
    label: "Notifications"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "Bell",
    s: 16
  })), /*#__PURE__*/React.createElement(DSo.Button, {
    variant: "primary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "Plus",
      s: 16
    })
  }, "Create order"));
  return /*#__PURE__*/React.createElement(Page, {
    product: "orders",
    active: "orders",
    topActions: topActions
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '24px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Orders",
    title: "Orders",
    sub: "Direct and wholesale orders across every channel.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DSo.Button, {
      variant: "secondary",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        n: "Download",
        s: 15
      })
    }, "Export"), /*#__PURE__*/React.createElement(DSo.Button, {
      variant: "primary",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        n: "Plus",
        s: 15
      })
    }, "Create order"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Orders today",
    value: "18",
    delta: "+12%",
    deltaTone: "up",
    sub: "vs. yesterday"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Revenue, 7d",
    value: "$8,940",
    delta: "+6.4%",
    deltaTone: "up",
    sub: "wholesale + DTC"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Unfulfilled",
    value: "6",
    sub: "2 past SLA"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Avg. order",
    value: "$122",
    unit: "/order",
    delta: "-3.1%",
    deltaTone: "down",
    sub: "last 30d"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      background: 'var(--panel)',
      padding: 3,
      borderRadius: 'var(--radius-md)'
    }
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => {
      setTab(t.id);
      setSel(new Set());
    },
    style: {
      padding: '5px 11px',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      background: tab === t.id ? 'var(--surface)' : 'transparent',
      color: tab === t.id ? 'var(--ink)' : 'var(--muted)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: tab === t.id ? 600 : 500,
      boxShadow: tab === t.id ? 'var(--shadow-xs)' : 'none'
    }
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(DSo.Button, {
    variant: "ghost",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "ListFilter",
      s: 15
    })
  }, "Filter"), /*#__PURE__*/React.createElement(DSo.Button, {
    variant: "ghost",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "ArrowUpDown",
      s: 15
    })
  }, "Sort")), someSel && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 14px',
      background: 'var(--accent-soft)',
      borderBottom: '1px solid var(--accent-border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--accent-text)'
    }
  }, sel.size, " selected"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(DSo.Button, {
    variant: "secondary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "Package",
      s: 14
    })
  }, "Mark fulfilled"), /*#__PURE__*/React.createElement(DSo.Button, {
    variant: "secondary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "Printer",
      s: 14
    })
  }, "Print labels"), /*#__PURE__*/React.createElement(DSo.Button, {
    variant: "secondary",
    size: "sm",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "Tag",
      s: 14
    })
  }, "Tag")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSel(new Set()),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--accent-text)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 500
    }
  }, "Clear")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 780,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("colgroup", null, /*#__PURE__*/React.createElement("col", {
    style: {
      width: '40px'
    }
  }), COLS.map(c => /*#__PURE__*/React.createElement("col", {
    key: c.id,
    style: c.id === 'cust' ? undefined : {
      width: c.w
    }
  }))), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--panel)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '9px 0 9px 14px',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(DSo.Checkbox, {
    checked: allSel,
    onChange: toggleAll
  })), COLS.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.id,
    onClick: () => setSortCol(c.id),
    style: {
      padding: '9px 14px',
      textAlign: c.right ? 'right' : 'left',
      cursor: 'pointer',
      userSelect: 'none',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      borderBottom: '1px solid var(--hairline)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      flexDirection: c.right ? 'row-reverse' : 'row'
    }
  }, c.label, sort.col === c.id && /*#__PURE__*/React.createElement(Icon, {
    n: sort.dir === 'asc' ? 'ChevronUp' : 'ChevronDown',
    s: 13,
    color: "var(--accent-600)"
  })))))), /*#__PURE__*/React.createElement("tbody", null, rows.map(o => {
    const on = sel.has(o.id);
    return /*#__PURE__*/React.createElement("tr", {
      key: o.id,
      style: {
        background: on ? 'var(--accent-soft)' : 'transparent',
        transition: 'background var(--duration-fast) var(--ease-out)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'var(--surface-hover)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '11px 0 11px 14px',
        borderBottom: '1px solid var(--hairline)'
      }
    }, /*#__PURE__*/React.createElement(DSo.Checkbox, {
      checked: on,
      onChange: () => toggleOne(o.id)
    })), /*#__PURE__*/React.createElement("td", {
      style: cellStyle(true)
    }, /*#__PURE__*/React.createElement("a", {
      href: "batch.html",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--accent-700)',
        textDecoration: 'none'
      }
    }, o.id)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle()
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(DSo.Avatar, {
      name: o.cust,
      size: "xs"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--ink)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, o.cust), !o.paid && /*#__PURE__*/React.createElement(DSo.Badge, {
      tone: "danger"
    }, "Unpaid"))), /*#__PURE__*/React.createElement("td", {
      style: cellStyle()
    }, /*#__PURE__*/React.createElement(DSo.Tag, null, o.channel)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle(true)
    }, o.items), /*#__PURE__*/React.createElement("td", {
      style: cellStyle()
    }, /*#__PURE__*/React.createElement("span", {
      className: "roast-chip",
      "data-roast": o.roast,
      title: o.roast
    })), /*#__PURE__*/React.createElement("td", {
      style: cellStyle(true, true)
    }, money(o.total)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle()
    }, /*#__PURE__*/React.createElement(DSo.Badge, {
      tone: o.statusTone,
      dot: true
    }, o.statusLabel)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle(true)
    }, o.date.slice(5)));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderTop: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, rows.length, " of ", ORDERS.length, " orders"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(DSo.Button, {
    variant: "secondary",
    size: "sm",
    disabled: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "ChevronLeft",
      s: 15
    })
  }, "Prev"), /*#__PURE__*/React.createElement(DSo.Button, {
    variant: "secondary",
    size: "sm",
    rightIcon: /*#__PURE__*/React.createElement(Icon, {
      n: "ChevronRight",
      s: 15
    })
  }, "Next"))))));
}
function cellStyle(mono, right) {
  return {
    padding: '11px 14px',
    borderBottom: '1px solid var(--hairline)',
    verticalAlign: 'middle',
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
    fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
    fontSize: mono ? 13 : 14,
    color: 'var(--text-secondary)',
    textAlign: right ? 'right' : 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
}
Object.assign(window, {
  OrdersScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coffee-ops/orders.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coffee-ops/shell.jsx
try { (() => {
// Coffee-ops suite — shared shell: Icon, Sidebar (product switcher + nav), Topbar, layout.
const DS = window.CoffeeTechDesignSystem_579fe4;
function Icon({
  n,
  s = 18,
  color,
  style,
  strokeWidth
}) {
  const ref = React.useRef();
  React.useEffect(() => {
    if (ref.current && window.lucide && lucide[n]) {
      ref.current.innerHTML = '';
      const el = lucide.createElement(lucide[n]);
      el.setAttribute('width', s);
      el.setAttribute('height', s);
      if (strokeWidth) el.setAttribute('stroke-width', strokeWidth);
      ref.current.appendChild(el);
    }
  }, [n, s, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-flex',
      flex: 'none',
      color: color || 'currentColor',
      ...style
    }
  });
}

// The suite's apps (product switcher targets)
const PRODUCTS = [{
  id: 'orders',
  label: 'Orders',
  icon: 'ClipboardList',
  href: 'orders.html'
}, {
  id: 'roasting',
  label: 'Roasting',
  icon: 'Flame',
  href: 'batch.html'
}, {
  id: 'inventory',
  label: 'Inventory',
  icon: 'Package',
  href: '#'
}, {
  id: 'wholesale',
  label: 'Wholesale',
  icon: 'Store',
  href: '#'
}, {
  id: 'market',
  label: 'Green market',
  icon: 'Sprout',
  href: '#'
}];
const NAVS = {
  orders: [{
    id: 'overview',
    label: 'Overview',
    icon: 'LayoutGrid',
    href: '#'
  }, {
    id: 'orders',
    label: 'Orders',
    icon: 'ClipboardList',
    href: 'orders.html'
  }, {
    id: 'wholesale',
    label: 'Wholesale',
    icon: 'Store',
    href: '#'
  }, {
    id: 'customers',
    label: 'Customers',
    icon: 'Users',
    href: '#'
  }, {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    href: '#'
  }],
  roasting: [{
    id: 'overview',
    label: 'Overview',
    icon: 'LayoutGrid',
    href: '#'
  }, {
    id: 'batches',
    label: 'Batches',
    icon: 'Layers',
    href: 'batch.html'
  }, {
    id: 'live',
    label: 'Live roast',
    icon: 'Activity',
    href: '#'
  }, {
    id: 'green',
    label: 'Green stock',
    icon: 'Package',
    href: '#'
  }, {
    id: 'profiles',
    label: 'Profiles',
    icon: 'LineChart',
    href: '#'
  }]
};
function BrandMark({
  size = 28
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flex: 'none',
      borderRadius: 'var(--radius-md)',
      background: 'var(--accent-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: size * 0.4,
      height: size * 0.4,
      borderRadius: 'var(--radius-sm)',
      border: `${Math.max(2, size * 0.09)}px solid var(--neutral-50)`
    }
  }));
}
function Sidebar({
  product = 'orders',
  active = 'orders',
  collapsed
}) {
  const [switcher, setSwitcher] = React.useState(false);
  const nav = NAVS[product] || NAVS.orders;
  const current = PRODUCTS.find(p => p.id === product) || PRODUCTS[0];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)',
      flex: 'none',
      height: '100%',
      background: 'var(--panel)',
      borderRight: '1px solid var(--hairline)',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSwitcher(v => !v),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface)',
      cursor: 'pointer',
      textAlign: 'left',
      boxShadow: 'var(--shadow-xs)'
    }
  }, /*#__PURE__*/React.createElement(BrandMark, {
    size: 26
  }), !collapsed && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 14,
      letterSpacing: '-0.01em',
      color: 'var(--ink)',
      lineHeight: 1.1
    }
  }, "Ledger & Roast"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, current.label)), !collapsed && /*#__PURE__*/React.createElement(Icon, {
    n: "ChevronsUpDown",
    s: 15,
    color: "var(--muted)"
  })), switcher && !collapsed && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      right: 0,
      zIndex: 40,
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 8px 6px',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, "Switch app"), PRODUCTS.map(p => /*#__PURE__*/React.createElement("a", {
    key: p.id,
    href: p.href,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 8px',
      borderRadius: 'var(--radius-sm)',
      textDecoration: 'none',
      background: p.id === product ? 'var(--accent-soft)' : 'transparent',
      color: p.id === product ? 'var(--accent-text)' : 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: p.id === product ? 600 : 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: p.icon,
    s: 16
  }), p.label)))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      flex: 1
    }
  }, nav.map(item => {
    const on = active === item.id;
    return /*#__PURE__*/React.createElement("a", {
      key: item.id,
      href: item.href,
      title: item.label,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '8px 10px',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        background: on ? 'var(--accent-soft)' : 'transparent',
        color: on ? 'var(--accent-text)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-md)',
        fontWeight: on ? 600 : 500,
        boxShadow: on ? 'inset 2px 0 0 var(--accent-500)' : 'none',
        transition: 'background var(--duration-normal) var(--ease-out), color var(--duration-normal) var(--ease-out)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'var(--surface-hover)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: item.icon,
      s: 17,
      strokeWidth: on ? 2.2 : 1.8
    }), !collapsed && item.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--hairline)',
      paddingTop: 10,
      marginTop: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(DS.Avatar, {
    name: "Ravi Okonkwo",
    size: "sm"
  }), !collapsed && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "Ravi Okonkwo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Head roaster")), /*#__PURE__*/React.createElement(Icon, {
    n: "Settings",
    s: 16,
    color: "var(--muted)"
  }))));
}
function Topbar({
  children
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--topbar-h)',
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 20px',
      borderBottom: '1px solid var(--hairline)',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      flex: 1,
      maxWidth: 380,
      height: 34,
      padding: '0 12px',
      background: 'var(--panel)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "Search",
    s: 15
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search orders, batches, SKUs\u2026",
    style: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--ink)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      padding: '1px 5px',
      border: '1px solid var(--hairline)',
      borderRadius: 4,
      color: 'var(--text-tertiary)'
    }
  }, "\u2318K")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, children));
}
function Page({
  product,
  active,
  topActions,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      background: 'var(--paper)'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    product: product,
    active: active
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Topbar, null, topActions), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children)));
}

// Page header inside content area
function PageHead({
  eyebrow,
  title,
  sub,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 6
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontOpticalSizing: 'auto',
      fontWeight: 500,
      fontSize: 'var(--text-3xl)',
      letterSpacing: '-0.02em',
      margin: 0,
      color: 'var(--ink)'
    }
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--muted)'
    }
  }, sub)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, actions));
}
Object.assign(window, {
  Icon,
  Sidebar,
  Topbar,
  Page,
  PageHead,
  BrandMark,
  SuiteShellReady: true
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coffee-ops/shell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.RoastChip = __ds_scope.RoastChip;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Avatar = __ds_scope.Avatar;

})();
