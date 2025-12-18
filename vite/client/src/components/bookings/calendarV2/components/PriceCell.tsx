//types
import type { JSX } from "react";

//libs
import classNames from "classnames";

//services & utils
import { formatCurrency } from "utils/currencyHelper";

function PriceCell({
  price,
  hasCleaning,
}: {
  price?: number;
  hasCleaning?: boolean;
}): JSX.Element {
  return (
    <td
      className={classNames(
        "data-cell text-center align-content-center text-muted",
        {
          "table-danger": price && price > 0,
          "border-top-danger": hasCleaning,
        }
      )}>
      {formatCurrency(price, "COP")}
    </td>
  );
}

export default PriceCell;
