import { getRawOrders, splitOrders } from '../utils/textHelpers.js';
import { OrderParser } from '../core/OrderParser.js';
import { Printer } from '../core/Printer.js';
import { ClipboardHandler } from './Clipboard.js';
import { Order } from '../core/Order.js';

export function setupEventHandlers () {
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
    pasteBtn.addEventListener ("click", ClipboardHandler.pasteAndPrint);
  }
}

function printFromTextarea () {
  const textarea = document.getElementById("orderText");
  const text = textarea.value.trim();

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