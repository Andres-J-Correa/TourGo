import { createTheme } from "@mui/material/styles";

import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
import boxShadows from "assets/theme/base/boxShadows";
import breakpoints from "assets/theme/base/breakpoints";

import boxShadow from "assets/theme/functions/boxShadow";
import linearGradient from "assets/theme/functions/linearGradient";
import pxToRem from "assets/theme/functions/pxToRem";
import rgba from "assets/theme/functions/rgba";
import hexToRgb from "assets/theme/functions/hexToRgb";

export default createTheme({
  breakpoints: { ...breakpoints },
  palette: { ...colors },
  borders: { ...borders },
  boxShadows: { ...boxShadows },
  functions: { linearGradient, pxToRem, boxShadow, rgba, hexToRgb },
});
