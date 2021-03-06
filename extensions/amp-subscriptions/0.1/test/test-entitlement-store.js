/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Entitlement,
  Entitlements,
} from '../../../../third_party/subscriptions-project/apis';

import {EntitlementStore} from '../entitlement-store';

describes.realWin('entitlement-store', {}, () => {
  let entitlementStore;
  const serviceIds = ['service1', 'service2'];
  const currentProduct = 'currentProductId';
  const sampleEntitlement1 =
    new Entitlement(serviceIds[0], ['currentProductId'], '');
  const sampleEntitlement2 =
    new Entitlement(serviceIds[1], ['product3'], '');
  const entitlementsForService1 = new Entitlements(
      serviceIds[0], '', [sampleEntitlement1], currentProduct);
  const entitlementsForService2 = new Entitlements(
      serviceIds[1], '', [sampleEntitlement2], currentProduct);

  beforeEach(() => {
    entitlementStore = new EntitlementStore(serviceIds);
  });

  it('should instantiate with the service ids', () => {
    expect(entitlementStore.serviceIds_).to.be.equal(serviceIds);
  });

  it('should call onChange callbacks on every resolve', () => {
    const cb = sandbox.stub(entitlementStore.onChangeCallbacks_, 'fire');
    entitlementStore.onChange(cb);
    entitlementStore.resolveEntitlement('service2',
        new Entitlement('service2', ['product1'], ''));
    expect(cb).to.be.calledOnce;
  });

  describe('firstResolvedPromise_', () => {
    it('should resolve true on recieving a positive entitlement', done => {
      entitlementStore.getFirstResolvedSubscription()
          .then(entitlements => {
            if (entitlements === true) {
              done();
            } else {
              throw new Error('Incorrect entitlement resolved');
            }
          });
      entitlementStore.resolveEntitlement(serviceIds[1],
          entitlementsForService2);
      entitlementStore.resolveEntitlement(serviceIds[0],
          entitlementsForService1);
    });

    it('should resolve true for existing positive entitlement', done => {
      entitlementStore.entitlements_[serviceIds[0]] = entitlementsForService1;
      entitlementStore.entitlements_[serviceIds[1]] = entitlementsForService2;
      entitlementStore.getFirstResolvedSubscription()
          .then(entitlements => {
            if (entitlements === true) {
              done();
            } else {
              throw new Error('Incorrect entitlement resolved');
            }
          });
    });

    it('should resolve false with null for negative entitlement', done => {
      const negativeEntitlement1 =
          new Entitlement(serviceIds[0], ['product1'], '');
      const negativeEntitlements = new Entitlements(
          serviceIds[0], '', [negativeEntitlement1], currentProduct);
      entitlementStore.entitlements_[serviceIds[0]] = negativeEntitlements;
      entitlementStore.entitlements_[serviceIds[1]] = entitlementsForService2;
      entitlementStore.getFirstResolvedSubscription()
          .then(entitlements => {
            if (entitlements === false) {
              done();
            } else {
              throw new Error('Incorrect entitlement resolved');
            }
          });
    });
  });
});

