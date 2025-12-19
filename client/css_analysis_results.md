# CSS Analysis Results

## 1. Redundant Classes

These classes are defined in `src/index.css` but are already provided by Bootstrap 5.3.
**Recommendation**: Check if your custom definition intentionally overrides Bootstrap. If not, these can be removed to reduce bundle size.

_(Partial list, see specific patterns)_

- **Layout**: `.container`, `.container-fluid`, `.row`, `.col`, `.d-flex`, `.d-block`, `.d-none`
- **Spacing**: `.m-0` to `.m-5`, `.p-0` to `.p-5` (and variations like `mt`, `mb`, `py`, `px`, `my`, `mx`)
- **Typography**: `.text-center`, `.text-white`, `.text-dark`, `.text-success`
- **Components**: `.btn`, `.btn-dark`, `.card`, `.badge`, `.dropdown-menu`, `.dropdown-item`, `.nav-link`, `.navbar`, `.list-group`
- **Positioning**: `.position-relative`, `.position-absolute`, `.top-0`, `.start-0`

**key examples**:

- `.container`
- `.row`
- `.d-flex`
- `.justify-content-center`
- `.align-items-center`
- `.mt-4`
- `.mb-3`
- `.p-4`

## 2. Potentially Unused Classes

These classes were found in `src/index.css` but **NO usage** was found in your JavaScript/TypeScript/HTML files.
**Recommendation**: Verify if these are used dynamically (e.g. `className={"badge-" + type}`) before deleting.

### Unused Badge/Button Variations

- `.badge-lg`, `.badge-md`, `.badge-success`, `.badge-white`
- `.btn-outline-dark` (if listed as unused)

### Unused Margins/Padding (Negative or specific)

- `.mt-n1` to `.mt-n12` (Negative top margins)
- `.ms-n3`, `.mx-n3`, `.mx-n5`
- `.pt-7`, `.pb-7`, `.py-6`, `.py-7`

### Unused Opacity Utilities

- `.opacity-1`, `.opacity-2`, `.opacity-3`, `.opacity-5` through `.opacity-9`
- `.opacity-0`

### Unused Icons (FontAwesome)

- `.fa-cc-amex`, `.fa-cc-mastercard`, `.fa-cc-visa`, `.fa-cc-paypal`
- `.fa-dribbble`, `.fa-facebook`, `.fa-pinterest`, `.fa-twitter`, `.fa-youtube`
- `.fa-clock`, `.fa-lock`

### Unused Custom Utilities

- `.min-vh-75`, `.max-vh-50`
- `.z-index-3`, `.z-index-n1`, `.z-index-sticky`
- `.bg-gray-100`, `.bg-gray-200`
- `.shadow-blur`
- `.move-on-hover`
- `.border-radius-md`

## 3. False Positives (Ignore)

The analysis might have picked up these as classes, but they are likely font file extensions or URLs in the CSS:

- `.woff`, `.woff2`, `.ttf`, `.eot`, `.gstatic`

## Analysis Method

- **Redundancy**: Compared class selectors in `src/index.css` vs `bootstrap-5.3.8-dist/css/bootstrap.css`.
- **Usage**: Scanned all `.js`, `.jsx`, `.ts`, `.tsx`, `.html`, `.vue` files in `src` for token matches.
