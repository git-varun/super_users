import { registry } from "../registry";
import { AmazonProvider, AmazonFreshProvider } from "./amazon";
import { FlipkartProvider, FlipkartGroceryProvider } from "./flipkart";
import { BlinkitProvider } from "./blinkit";
import { InstamartProvider } from "./swiggy";
import { ZeptoProvider } from "./zepto";
import { MyntraProvider } from "./myntra";
import { NykaaProvider } from "./nykaa";
import { UniqloProvider } from "./uniqlo";
import { HMProvider } from "./hm";
import { AdidasProvider } from "./adidas";
import { PumaProvider } from "./puma";

export function initProviders() {
  registry.register(AmazonProvider);
  registry.register(AmazonFreshProvider);
  registry.register(FlipkartProvider);
  registry.register(FlipkartGroceryProvider);
  registry.register(BlinkitProvider);
  registry.register(InstamartProvider);
  registry.register(ZeptoProvider);
  registry.register(MyntraProvider);
  registry.register(NykaaProvider);
  registry.register(UniqloProvider);
  registry.register(HMProvider);
  registry.register(AdidasProvider);
  registry.register(PumaProvider);
}
