/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Phone number is required" };
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");

  // Check if it's all digits and has reasonable length (7-15 digits)
  const phoneRegex = /^\d{7,15}$/;
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: "Invalid phone number format" };
  }

  return { valid: true };
};

/**
 * Validate address format
 */
export const validateAddress = (address) => {
  if (!address || typeof address !== "string") {
    return { valid: false, error: "Address is required" };
  }

  const trimmed = address.trim();
  if (trimmed.length < 5) {
    return { valid: false, error: "Address must be at least 5 characters" };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: "Address must be less than 200 characters" };
  }

  return { valid: true };
};

/**
 * Validate price (must be positive number)
 */
export const validatePrice = (price) => {
  if (price === null || price === undefined) {
    return { valid: false, error: "Price is required" };
  }

  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return { valid: false, error: "Price must be a valid number" };
  }

  if (numPrice < 0) {
    return { valid: false, error: "Price cannot be negative" };
  }

  if (numPrice > 10000000) {
    return { valid: false, error: "Price is too large" };
  }

  return { valid: true, value: numPrice };
};

/**
 * Validate stock (must be non-negative integer)
 */
export const validateStock = (stock) => {
  if (stock === null || stock === undefined) {
    return { valid: false, error: "Stock is required" };
  }

  const numStock = typeof stock === "string" ? parseInt(stock, 10) : stock;

  if (isNaN(numStock)) {
    return { valid: false, error: "Stock must be a valid number" };
  }

  if (!Number.isInteger(numStock)) {
    return { valid: false, error: "Stock must be an integer" };
  }

  if (numStock < 0) {
    return { valid: false, error: "Stock cannot be negative" };
  }

  return { valid: true, value: numStock };
};

/**
 * Validate quantity (must be positive integer, not exceeding maxStock)
 */
export const validateQuantity = (quantity, maxStock = null) => {
  if (quantity === null || quantity === undefined) {
    return { valid: false, error: "Quantity is required" };
  }

  const numQuantity =
    typeof quantity === "string" ? parseInt(quantity, 10) : quantity;

  if (isNaN(numQuantity)) {
    return { valid: false, error: "Quantity must be a valid number" };
  }

  if (!Number.isInteger(numQuantity)) {
    return { valid: false, error: "Quantity must be an integer" };
  }

  if (numQuantity < 1) {
    return { valid: false, error: "Quantity must be at least 1" };
  }

  if (maxStock !== null && numQuantity > maxStock) {
    return {
      valid: false,
      error: `Quantity cannot exceed available stock (${maxStock})`,
    };
  }

  return { valid: true, value: numQuantity };
};

/**
 * Validate shipping address fields
 */
export const validateShippingAddress = (shippingInfo) => {
  const errors = [];

  if (!shippingInfo.fullName?.trim() && !shippingInfo.name?.trim()) {
    errors.push("Full name is required");
  }

  const emailValidation = validateEmail(shippingInfo.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error);
  }

  const phoneValidation = validatePhone(shippingInfo.phone);
  if (!phoneValidation.valid) {
    errors.push(phoneValidation.error);
  }

  const addressValidation = validateAddress(shippingInfo.address);
  if (!addressValidation.valid) {
    errors.push(addressValidation.error);
  }

  if (!shippingInfo.city?.trim()) {
    errors.push("City is required");
  }

  if (!shippingInfo.state?.trim()) {
    errors.push("State is required");
  }

  if (!shippingInfo.zip?.trim()) {
    errors.push("ZIP code is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate payment method
 */
export const validatePaymentMethod = (paymentMethod) => {
  const validMethods = ["cash_on_delivery", "card", "paypal"]; // Add more as needed

  if (!paymentMethod) {
    return { valid: false, error: "Payment method is required" };
  }

  if (!validMethods.includes(paymentMethod)) {
    return {
      valid: false,
      error: `Invalid payment method. Must be one of: ${validMethods.join(
        ", "
      )}`,
    };
  }

  return { valid: true };
};

/**
 * Helper to fetch variant images for cart items
 */
export const fetchVariantImages = async (supabase, items) => {
  if (!items || items.length === 0) {
    return items || [];
  }

  const itemsWithImages = await Promise.all(
    items.map(async (item) => {
      if (item.variant_id) {
        const { data: variantImages } = await supabase
          .from("product_variant_images")
          .select("*")
          .eq("variant_id", item.variant_id)
          .order("is_primary", { ascending: false })
          .order("display_order", { ascending: true });

        return {
          ...item,
          variant: item.variant
            ? {
                ...item.variant,
                images: variantImages || [],
              }
            : null,
        };
      }
      return item;
    })
  );

  return itemsWithImages;
};
