// The stable public URL for the embeddable element:
//
//   <script type="module" src="https://ca.davidyc.com/element.js"></script>
//   <ca-background sim="boids"></ca-background>
//
// Embedders point here and never at a path inside src/, so the internals can be
// reorganised without breaking anyone's page. See embed.html for the attributes.
import { CaBackground } from './src/element.js';

if (!customElements.get('ca-background')) customElements.define('ca-background', CaBackground);
