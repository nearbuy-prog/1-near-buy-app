"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Phone,
  Store as StoreIcon,
  MapPin,
  ShoppingBag,
  BookmarkPlus,
  Send,
  Wand2,
} from "lucide-react";
import type { Product, Store } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { telHref, whatsappProductHref, mapHref } from "@/lib/utils/contact";
import { OrderRequestModal } from "./OrderRequestModal";
import { ReserveModal } from "./ReserveModal";
import { RequestCustomizationModal } from "./RequestCustomizationModal";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { t } from "@/lib/i18n/translations";

interface ProductActionsProps {
  product: Product;
  store: Store;
  selectedSize?: string;
  selectedColor?: string;
}

export function ProductActions({
  product,
  store,
  selectedSize,
  selectedColor,
}: ProductActionsProps) {
  const [orderOpen, setOrderOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const openConvo = useMessagesStore((s) => s.openConversation);
  const locale = useLanguageStore((s) => s.locale);
  const router = useRouter();

  // Personalized / made-to-order products get a customization request flow.
  const canCustomize =
    product.fulfillment === "customizable" ||
    product.fulfillment === "made-to-order";
  // Online/home businesses that don't receive visitors: hide map & directions.
  const showMap = store.accepts_visitors !== false;

  const handleMessage = () => {
    const convo = openConvo({ store_id: store.id, product_id: product.id });
    router.push(`/messages/${convo.id}`);
  };

  return (
    <>
      <div className="space-y-2">
        {canCustomize && (
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            onClick={() => setCustomizeOpen(true)}
          >
            <Wand2 className="h-4 w-4" />
            {t.handmade.requestCustomization[locale]}
          </Button>
        )}
        {product.in_stock && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setReserveOpen(true)}
          >
            <BookmarkPlus className="h-4 w-4" />
            {t.product.reserve[locale]}
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleMessage}
          >
            <Send className="h-4 w-4" />
            {t.product.messageStore[locale]}
          </Button>
          {store.accepts_online_orders && product.in_stock ? (
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => setOrderOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              {t.product.orderOnline[locale]}
            </Button>
          ) : (
            <a href={telHref(store.phone)}>
              <Button variant="default" size="lg" className="w-full">
                <Phone className="h-4 w-4" />
                {t.product.callStore[locale]}
              </Button>
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a href={whatsappProductHref(store, product)} target="_blank" rel="noreferrer">
            <Button variant="whatsapp" size="default" className="w-full">
              <MessageCircle className="h-4 w-4" />
              {t.product.whatsapp[locale]}
            </Button>
          </a>
          <a href={telHref(store.phone)}>
            <Button variant="outline" size="default" className="w-full">
              <Phone className="h-4 w-4" />
              {t.product.call[locale]}
            </Button>
          </a>
        </div>

        <div className={`grid gap-2 ${showMap ? "grid-cols-2" : "grid-cols-1"}`}>
          <a href={`/store/${store.id}`}>
            <Button variant="ghost" size="default" className="w-full">
              <StoreIcon className="h-4 w-4" />
              {t.product.viewStore[locale]}
            </Button>
          </a>
          {showMap && (
            <a
              href={mapHref(store.location.lat, store.location.lng, store.name_en)}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="default" className="w-full">
                <MapPin className="h-4 w-4" />
                {t.product.viewMap[locale]}
              </Button>
            </a>
          )}
        </div>
      </div>

      <OrderRequestModal
        product={product}
        store={store}
        open={orderOpen}
        onOpenChange={setOrderOpen}
      />
      <ReserveModal
        product={product}
        store={store}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        open={reserveOpen}
        onOpenChange={setReserveOpen}
      />
      {canCustomize && (
        <RequestCustomizationModal
          product={product}
          store={store}
          open={customizeOpen}
          onOpenChange={setCustomizeOpen}
        />
      )}
    </>
  );
}
