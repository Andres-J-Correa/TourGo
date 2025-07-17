//types
import type { JSX } from "react";

//services & utils
import { formatCurrency } from "utils/currencyHelper";

function PriceCell({ price }: { price: number | undefined }): JSX.Element {
  return (
    <td
      className="data-cell text-center align-content-center"
      style={{ minWidth: 140, maxWidth: 140 }}>
      {formatCurrency(price, "COP")}
    </td>
  );
}

export default PriceCell;
