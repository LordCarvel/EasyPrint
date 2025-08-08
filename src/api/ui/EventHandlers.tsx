import { getRawOrders, splitOrders } from '../utils/textHelpers';
import { OrderParser } from '../core/OrderParser';
import { Printer } from '../core/Printer';
import { ClipboardHandler } from './Clipboard';
import { Order } from '../core/Order';

export function setupEventHandlers(): void {
  const textarea = document.getElementById("orderText") as HTMLTextAreaElement | null;
  const pasteBtn = document.getElementById("pasteBtn") as HTMLButtonElement | null;

  if (textarea) {
    textarea.addEventListener("keydown", (e: KeyboardEvent) => {
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

function printFromTextarea(): void {
  const textarea = document.getElementById("orderText") as HTMLTextAreaElement | null;
  const text = textarea?.value.trim() ?? "";

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