import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  tenantId: string;
}

@Injectable()
export class TenantContext {
  private static readonly storage = new AsyncLocalStorage<TenantStore>();

  static run(store: TenantStore, callback: () => void) {
    return this.storage.run(store, callback);
  }

  static getTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (tenantId) {
      TenantContext.run({ tenantId }, () => next());
    } else {
      next();
    }
  }
}
