import { niche } from "@/config/niche";

export interface ProductDefaults {
  slug: string;
  name: string;
  brand: string;
  material: string;
  diameterMm: number;
  colour: string;
  netWeightG: number;
}

// Pola produktu używane przy dodawaniu i edycji. Nazwy pól muszą zgadzać się z productSchema.
export function ProductFields({
  idPrefix,
  defaults,
  lockSlug = false,
}: {
  idPrefix: string;
  defaults?: ProductDefaults;
  lockSlug?: boolean;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <div className="form-grid">
      <div className="field">
        <label htmlFor={id("slug")}>Slug (adres)</label>
        <input
          id={id("slug")}
          name="slug"
          required
          maxLength={120}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={defaults?.slug}
          readOnly={lockSlug}
        />
      </div>
      <div className="field">
        <label htmlFor={id("name")}>Nazwa</label>
        <input id={id("name")} name="name" required maxLength={160} defaultValue={defaults?.name} />
      </div>
      <div className="field">
        <label htmlFor={id("brand")}>Marka</label>
        <input id={id("brand")} name="brand" required maxLength={80} defaultValue={defaults?.brand} />
      </div>
      <div className="field">
        <label htmlFor={id("material")}>Materiał</label>
        <select id={id("material")} name="material" required defaultValue={defaults?.material}>
          {niche.materials.map((material) => (
            <option key={material} value={material}>
              {material}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={id("diameter")}>Średnica (mm)</label>
        <input
          id={id("diameter")}
          name="diameterMm"
          type="number"
          step="0.01"
          min="0.1"
          required
          defaultValue={defaults?.diameterMm ?? 1.75}
        />
      </div>
      <div className="field">
        <label htmlFor={id("colour")}>Kolor</label>
        <input id={id("colour")} name="colour" required maxLength={40} defaultValue={defaults?.colour} />
      </div>
      <div className="field">
        <label htmlFor={id("weight")}>Masa netto (g)</label>
        <input
          id={id("weight")}
          name="netWeightG"
          type="number"
          step="1"
          min="1"
          required
          defaultValue={defaults?.netWeightG ?? 1000}
        />
      </div>
    </div>
  );
}
