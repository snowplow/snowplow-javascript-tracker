// const getUEEvents = F.compose(F.filter(F.compose(F.eq('ue'), F.get('evt.e'))), F.first);

// it('attaches enhanced ecommerce contexts to enhanced ecommerce events', () => {
//   const state = new SharedState();
//   newTracker('', '', {
//     stateStorageStrategy: 'cookie',
//     encodeBase64: false,
//   });

//   addEnhancedEcommerceProductContext('1234-5678', 'T-Shirt');
//   t.addEnhancedEcommerceImpressionContext('1234-5678', 'T-Shirt');
//   t.addEnhancedEcommercePromoContext('1234-5678', 'T-Shirt');
//   t.addEnhancedEcommerceActionContext('1234-5678', 'T-Shirt');
//   t.trackEnhancedEcommerceAction();

//   const findWithStaticValue = F.filter(F.get('data.id'));
//   const extractContextsWithStaticValue = F.compose(findWithStaticValue, F.flatten, extractSchemas, getUEEvents);

//   const countWithStaticValueEq = (value: string) =>
//     F.compose(F.size, F.filter(F.compose(F.eq(value), F.get('data.id'))), extractContextsWithStaticValue);

//   // we expect there to be four contexts added to the event
//   expect(countWithStaticValueEq('1234-5678')(state.outQueues)).toBe(4);
// });
