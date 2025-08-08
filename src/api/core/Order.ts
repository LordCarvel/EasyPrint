export interface PaymentInfo {
  lines: string[];
  method: "unknown" | "ifood" | "customer";
  collectOnDelivery: boolean;
}

export interface OrderData {
  orderNumber?: string;
  custumerName?: string;
  branch?: string;
  locator?: string;
  timeInfo?: string;
  deliveryEstimate?: string;
  address?: string;
  deliveryInfo?: string;
  items?: string[];
  payment?: PaymentInfo;
  notes?: string;
}

export class Order {
  orderNumber: string;
  custumerName: string;
  branch: string;
  locator: string;
  timeInfo: string;
  deliveryEstimate: string;
  address: string;
  deliveryInfo: string;
  items: string[];
  payment: PaymentInfo;
  notes: string;

  constructor({
    orderNumber = "",
    custumerName = "",
    branch = "",
    locator = "",
    timeInfo = "",
    deliveryEstimate = "",
    address = "",
    deliveryInfo = "",
    items = [],
    payment = { lines: [], method: "unknown", collectOnDelivery: false },
    notes = "",
  }: OrderData = {}) {
    this.orderNumber = orderNumber;
    this.custumerName = custumerName;
    this.branch = branch;
    this.locator = locator;
    this.timeInfo = timeInfo;
    this.deliveryEstimate = deliveryEstimate;
    this.address = address;
    this.deliveryInfo = deliveryInfo;
    this.items = Array.isArray(items) ? [...items] : [];

    this.payment = {
      lines: Array.isArray(payment.lines) ? [...payment.lines] : [],
      method: payment.method || "unknown",
      collectOnDelivery: Boolean(payment.collectOnDelivery),
    };

    this.notes = notes;
  }

  static fromParsed(parsed: OrderData): Order {
    return new Order(parsed);
  }

  isPaidViaIfood(): boolean {
    return this.payment.method === "ifood";
  }

  isPaidByCustomer(): boolean {
    return this.payment.method === "customer";
  }

  isCollectOnDelivery(): boolean {
    return this.payment.collectOnDelivery;
  }

  hasItems(): boolean {
    return this.items.length > 0;
  }

  hasDeliveryInfo(): boolean {
    return Boolean(this.deliveryInfo && this.deliveryInfo.trim());
  }

  toPlainObject(): OrderData {
    return {
      orderNumber: this.orderNumber,
      custumerName: this.custumerName,
      branch: this.branch,
      locator: this.locator,
      timeInfo: this.timeInfo,
      deliveryEstimate: this.deliveryEstimate,
      address: this.address,
      deliveryInfo: this.deliveryInfo,
      items: [...this.items],
      payment: { ...this.payment },
      notes: this.notes,
    };
  }

  summary(): string {
    const itemsCount = this.items.length;
    const pay = this.payment.method;
    const cod = this.payment.collectOnDelivery ? " + cobrar na entrega" : "";

    return `#${this.orderNumber} ${this.custumerName} @ ${this.branch} — ${itemsCount} item(s), pagamento: ${pay}${cod}`;
  }
}
