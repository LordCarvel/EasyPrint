import { getRawOrders, splitOrders } from "../utils/textHelpers";
import { OrderParser } from "../core/OrderParser";
import { Printer } from "../core/Printer";
import { Order } from "../core/Order";

export class ClipboardHandler {
  static async pasteAndPrint(): Promise<void> {
    try {
      const text: string = await navigator.clipboard.readText();

      if (!text) {
        alert("Clipboard vazio!");
        return;
      }

      const textarea = document.getElementById("orderText") as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.value = text;
      }

      const raw = getRawOrders(text);
      const lines = splitOrders(raw);
      const parsed = OrderParser.parse(lines);
      const order = Order.fromParsed(parsed);

      Printer.printOrder(order);
    } catch (err) {
      alert("Erro ao acessar o clipboard: " + String(err));
    }
  }
}