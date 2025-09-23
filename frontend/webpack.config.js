import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default{
  entry: "./src/main.ts", // ton point d'entrée principal
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // nettoie le dossier dist à chaque build
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
     extensionAlias: {
    ".js": [".ts", ".js"],  // <= le point clé !
  }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // ton fichier HTML d'origine
    }),
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 5173,
    open: true, // ouvre automatiquement le navigateur
    hot: true,
  },
};
