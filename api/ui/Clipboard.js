import { getRawOrders, splitOrders } from '../utils/textHelpers.js';
import { OrderParser } from '../core/OrderParser.js';
import { Printer } from '../core/Printer.js';
import { Order } from '../core/Order.js';

export class ClipboardHandler {
  static async pasteAndPrint () {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        alert("Clipboard vazio!");
        return;
      }

      const textarea = document.getElementById("orderText");
      textarea.value = text;

      const raw = getRawOrders(text);
      const lines = splitOrders(raw);
      const parsed = OrderParser.parse(lines);
      const order = Order.fromParsed(parsed);
      Printer.printOrder(order);
    } catch (err) {
      alert("Erro ao acessar o clipboard: " + err);
    }
  }
}