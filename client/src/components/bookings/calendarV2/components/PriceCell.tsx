//types
import type { JSX } from "react";

//libs
import classNames from "classnames";

//services & utils
import { formatCurrency } from "utils/currencyHelper";

function PriceCell({ price }: { price: number | undefined }): JSX.Element {
  return (
    <td
      className={classNames(
        "data-cell text-center align-content-center text-muted",
        {
          "table-danger": price && price > 0,
        }
      )}>
      {formatCurrency(price, "COP")}
    </td>
  );
}

export default PriceCell;
