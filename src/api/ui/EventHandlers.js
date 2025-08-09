import { getRawOrders, splitOrders } from '../utils/textHelpers';
import { OrderParser } from '../core/OrderParser';
import { Printer } from '../core/Printer';
import { ClipboardHandler } from './Clipboard';
import { Order } from '../core/Order';

export function setupEventHandlers() {
  const textarea = document.getElementById("orderText");
  const pasteBtn = document.getElementById("pasteBtn");

  if (textarea) {
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        printFromTextarea();
      }
    });
  }

  if (pasteBtn) {
    pasteBtn.addEventListener("click", ClipboardHandler.pasteAndPrint);
  }
}

function printFromTextarea() {
  const textarea = document.getElementById("orderText");
  const text = textarea?.value.trim() || "";

  if (!text) {
    alert("O campo está vazio!");
    return;
  }

  const raw = getRawOrders(text);
  const lines = splitOrders(raw);
  const parsed = OrderParser.parse(lines);
  const order = Order.fromParsed(parsed);

  Printer.printOrder(order);
}