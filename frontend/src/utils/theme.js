export const getTheme = (dark) => ({
  textPrimary:  dark ? '#ffffff'                    : '#111827',
  textSub:      dark ? 'rgba(255,255,255,0.5)'      : '#6b7280',
  surface:      dark ? 'rgba(255,255,255,0.04)'     : '#ffffff',
  surfaceSub:   dark ? 'rgba(255,255,255,0.02)'     : '#f8f9fa',
  border:       dark ? 'rgba(255,255,255,0.08)'     : '#ebebeb',
  shadow:       dark ? 'none'                       : '0 1px 12px rgba(0,0,0,0.05)',
  shadowMd:     dark ? 'none'                       : '0 2px 20px rgba(0,0,0,0.07)',
  rowHover:     dark ? 'rgba(255,255,255,0.03)'     : '#fafafa',
});