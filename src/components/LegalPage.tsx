'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useStoreSettingsQuery } from '../hooks/queries';

type Policy = 'privacy' | 'cookies' | 'terms';
type Section = { id: string; title: string; content: ReactNode };

const policies = {
  privacy: { title: 'Privacy Policy', href: '/privacy-policy', description: 'How we collect, use and look after your personal information.' },
  cookies: { title: 'Cookie Policy', href: '/cookie-policy', description: 'A clear guide to the cookies and browser storage used by our store.' },
  terms: { title: 'Terms & Conditions', href: '/terms-and-conditions', description: 'The details that guide your experience shopping with Deniqwears.' },
} satisfies Record<Policy, { title: string; href: string; description: string }>;

export function LegalPage({ policy }: { policy: Policy }) {
  const { data: settings } = useStoreSettingsQuery();
  const email = settings?.supportEmail || 'hello@deniqwears.com';
  const contact = <a href={`mailto:${email}`} className="underline underline-offset-4 hover:text-[#681F2C] break-words">{email}</a>;
  const returnWindow = settings?.returnPeriodDays;
  const sections: Record<Policy, Section[]> = {
    privacy: [
      { id: 'overview', title: 'Who we are', content: <p>Deniqwears is a US-based womenswear store serving customers across the United States. This policy explains how we handle information when you browse our website, place an order, subscribe to our newsletter or contact client care. For privacy questions, contact {contact}.</p> },
      { id: 'information', title: 'Information we collect', content: <><p>When you order, we collect your name, email address, phone number, shipping address, selected items and order details. We also receive payment status, transaction references and refund information from the payment provider you choose. Card details are entered on the payment provider’s checkout; our store does not store your full card number or security code.</p><p>When you subscribe to our newsletter, we store your email address and subscription status. If you contact us, we receive the information you include in your message. Our hosting and service providers may process technical information such as IP addresses, browser details and request logs to deliver and secure the website.</p></> },
      { id: 'use', title: 'How we use information', content: <p>We use information to process payments, fulfil and deliver orders, provide order updates, handle returns and refunds, answer questions, prevent fraud and meet our accounting and legal obligations. If you subscribe, we use your email for new designs, restocks and offers. Purchasing does not automatically subscribe you to our newsletter.</p> },
      { id: 'sharing', title: 'When information is shared', content: <p>We share information needed to provide our services with payment processors, delivery partners, email providers, address verification services and hosting providers. Depending on the payment method available at checkout, your payment is handled by Stripe, Paystack or Flutterwave under that provider’s own privacy policy. We may also disclose information when required by law or to protect customers and our business. Service providers may process information outside your state or country.</p> },
      { id: 'storage', title: 'Storage and security', content: <><p>We keep information as needed to fulfil orders, provide support, maintain business records and meet legal obligations. Some records may need to be retained after a deletion request for accounting, fraud prevention or disputes. We use safeguards to protect information, although no online service can guarantee complete security.</p><p>Your browser also saves cart contents and guest checkout contact and address details to help you resume shopping. On a shared device, clear this site’s browser data after shopping. See our <Link href="/cookie-policy" className="underline underline-offset-4">Cookie Policy</Link> for details.</p></> },
      { id: 'choices', title: 'Your choices and requests', content: <p>You can contact {contact} to request access to, correction of or deletion of your information, or to stop newsletter messages. Include the email address used for your order or subscription, but do not send payment card details. We may need to verify your identity. Your rights and any exceptions depend on the laws that apply to you. Opting out of marketing does not stop necessary order or service messages.</p> },
      { id: 'children', title: 'Children and external websites', content: <p>Our store is intended for adult shoppers and is not directed to children under 13. If you believe a child has provided personal information, please contact us. Links to social media and payment websites lead to services with their own privacy practices.</p> },
      { id: 'changes', title: 'Updates to this policy', content: <p>We may update this policy as our services or practices change. The date above identifies the latest revision. Where required, we will provide additional notice of significant changes.</p> },
    ],
    cookies: [
      { id: 'overview', title: 'Cookies and browser storage', content: <p>Cookies are small files a website places in your browser. Local storage is a separate browser feature that keeps information on your device between visits. This policy covers both technologies used by Deniqwears.</p> },
      { id: 'storage', title: 'What our store uses', content: <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><caption className="sr-only">Deniqwears cookies and local storage</caption><thead><tr className="border-b border-[#D8D4CC]"><th scope="col" className="py-3 pr-4 font-medium">Name / type</th><th scope="col" className="py-3 pr-4 font-medium">Purpose</th><th scope="col" className="py-3 font-medium">Duration</th></tr></thead><tbody><tr className="border-b border-[#D8D4CC]"><th scope="row" className="py-4 pr-4 font-normal"><code>deniq_cart_storage</code><br />Local storage</th><td className="py-4 pr-4">Remembers the items, sizes and quantities in your shopping bag.</td><td className="py-4">Until cleared by you or the browser; cart contents update as you shop.</td></tr><tr className="border-b border-[#D8D4CC]"><th scope="row" className="py-4 pr-4 font-normal"><code>deniq_guest_checkout</code><br />Local storage</th><td className="py-4 pr-4">Saves guest contact and shipping details so you can resume checkout.</td><td className="py-4">Until cleared by the store, you or the browser. No automatic expiry.</td></tr><tr className="border-b border-[#D8D4CC]"><th scope="row" className="py-4 pr-4 font-normal"><code>deniq_cookie_notice</code><br />Local storage</th><td className="py-4 pr-4">Remembers that you dismissed our cookie notice.</td><td className="py-4">Until cleared by you or the browser. No automatic expiry.</td></tr><tr><th scope="row" className="py-4 pr-4 font-normal"><code>deniq_admin_session</code><br />Cookie</th><td className="py-4 pr-4">Keeps authorised staff signed in to the store administration area. Set only after staff sign-in.</td><td className="py-4">Up to 7 days, or until staff sign out.</td></tr></tbody></table></div> },
      { id: 'third-parties', title: 'Payment providers and external services', content: <p>When you continue to a payment provider’s website, that provider may use cookies for payment processing, authentication and fraud prevention. Its own cookie and privacy policies apply. Social media links also open external services governed by their policies.</p> },
      { id: 'tracking', title: 'Analytics and advertising', content: <p>The current Deniqwears storefront does not include optional analytics or advertising trackers. If we introduce these technologies, we will update this policy and provide any choices required by applicable law before enabling them.</p> },
      { id: 'controls', title: 'Managing your browser data', content: <><p>You can remove cookies and local storage through your browser’s privacy or site-data settings. Search for this website and clear its stored data. Browser settings can also block cookies or storage. Removing or blocking data may reset your bag, erase saved checkout details or sign staff out.</p><p>Local storage remains on the device you use. Clear it after shopping on a shared device to remove your saved contact and delivery information. Clearing browser data does not delete order records held by our store; contact us for requests about those records.</p></> },
      { id: 'contact', title: 'Questions and updates', content: <p>For questions about cookies or browser storage, contact {contact}. Read our <Link href="/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link> for how we handle personal information. We will revise the date above when this policy changes.</p> },
    ],
    terms: [
      { id: 'overview', title: 'Shopping with Deniqwears', content: <p>These terms apply to use of the Deniqwears website and purchases from our store. Please read them before ordering. By placing an order, you agree to these terms. You must be legally able to enter into a purchase agreement or have the permission of a parent or guardian.</p> },
      { id: 'products', title: 'Products and availability', content: <p>We aim to describe our garments, sizing and colours accurately. Screen settings and fabric variations can affect how colours and details appear. Please review the product description and size guide before ordering. Availability is subject to stock; adding an item to your bag does not reserve it.</p> },
      { id: 'prices', title: 'Prices, payment and promotions', content: <p>Prices and applicable delivery charges are displayed at checkout. Review the final total and currency before paying. Payments are processed by the provider selected at checkout; collection payments are available only when offered by the store. Discount codes are subject to their stated conditions, eligibility, expiry and usage limits. Prices and promotions may change for future purchases.</p> },
      { id: 'orders', title: 'Orders and confirmation', content: <p>Please provide accurate contact and delivery details. We will send order updates to the details supplied. An order reference or payment receipt does not guarantee availability or dispatch. If we cannot fulfil an order because of stock, a pricing error or a payment issue, we will contact you and arrange an appropriate correction or refund of any amount paid for items we cannot supply.</p> },
      { id: 'delivery', title: 'Delivery', content: <p>We currently ship across the United States. Delivery options, fees and any available estimates are shown during checkout. Delivery dates are estimates unless expressly confirmed otherwise. Contact client care promptly if your address needs correcting or a parcel is delayed, missing or damaged; changes may not be possible after dispatch.</p> },
      { id: 'returns', title: 'Returns, exchanges and refunds', content: <><p>{returnWindow != null ? `Contact client care within ${returnWindow} days of receiving your order to request a return or exchange.` : <>See the current return window on our <Link href="/about" className="underline underline-offset-4">About & Client Care page</Link>, or contact us before ordering.</>} Include your order reference and the reason for your request. Contact us before sending a garment back so we can provide return instructions and explain any applicable costs or conditions.</p><p>If an item arrives damaged, faulty or different from what you ordered, please contact us promptly with details and, where helpful, photos. We will assess the issue and explain the available remedy. Approved refunds are normally returned through the original payment method; processing time depends on your payment provider. These terms do not limit any consumer rights that apply by law.</p></> },
      { id: 'changes', title: 'Order changes and cancellations', content: <p>Contact us as soon as possible to request a change or cancellation. We will check the order’s status and confirm what is possible. Once an order has been dispatched, it may need to be handled through the returns process.</p> },
      { id: 'use', title: 'Using our website', content: <p>Do not misuse the website, submit fraudulent orders, attempt unauthorised access or interfere with its operation. Our branding, photography, designs and written content belong to Deniqwears or their respective owners and may not be reproduced for commercial use without permission. External services have their own terms.</p> },
      { id: 'privacy', title: 'Privacy and cookies', content: <p>Our <Link href="/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link> explains how we handle personal information. Our <Link href="/cookie-policy" className="underline underline-offset-4">Cookie Policy</Link> explains cookies and saved browser data.</p> },
      { id: 'contact', title: 'Questions, disputes and updates', content: <p>For order concerns or questions about these terms, contact {contact} so we can work with you to resolve them. Applicable consumer law continues to apply. We may revise these terms for future purchases; the version in effect when you place your order applies to that purchase. The date above identifies this revision.</p> },
    ],
  };
  const current = policies[policy];

  return (
    <article className="max-w-[1344px] mx-auto px-5 md:px-12 py-16 md:py-24">
      <header className="max-w-3xl mb-12 md:mb-16">
        <Link href="/" className="text-xs uppercase tracking-[0.2em] text-[#681F2C] hover:underline underline-offset-4">Deniqwears / Client Care</Link>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.08] mt-6 mb-5">{current.title}</h1>
        <p className="text-lg font-light leading-relaxed text-[#56554F]">{current.description}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-[#56554F] mt-6">Last updated <time dateTime="2026-10-09">October 9, 2026</time></p>
      </header>
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-10 lg:gap-20 border-t border-[#D8D4CC] pt-10">
        <aside>
          <nav aria-label="Legal policies" className="space-y-3 mb-8">
            {Object.entries(policies).map(([key, item]) => (
              <Link key={key} href={item.href} aria-current={key === policy ? 'page' : undefined} className={`block text-sm py-2 border-b border-[#D8D4CC] hover:text-[#681F2C] ${key === policy ? 'text-[#681F2C] font-medium' : 'text-[#56554F]'}`}>{item.title}</Link>
            ))}
          </nav>
          <nav aria-label="On this page">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4">On this page</p>
            <ul className="space-y-3 text-sm text-[#56554F]">
              {sections[policy].map((section) => <li key={section.id}><a href={`#${section.id}`} className="hover:text-[#681F2C] hover:underline underline-offset-4">{section.title}</a></li>)}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0 max-w-3xl space-y-10">
          {sections[policy].map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-36">
              <h2 className="font-serif text-2xl md:text-3xl mb-4">{index + 1}. {section.title}</h2>
              <div className="text-base leading-relaxed text-[#56554F] space-y-4">{section.content}</div>
            </section>
          ))}
          <Link href="/shop" className="inline-block border-b border-[#171714] pb-2 text-xs uppercase tracking-[0.2em] hover:text-[#681F2C]">Back to the collection →</Link>
        </div>
      </div>
    </article>
  );
}
