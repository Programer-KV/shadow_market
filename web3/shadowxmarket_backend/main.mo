import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import RBTree "mo:base/RBTree";

persistent actor ShadowEscrow {

  // =====================================================
  // ESCROW ORDER STRUCTURE (IMMUTABLE RECORD)
  // =====================================================

  type EscrowOrder = {
    buyer : Principal;
    seller : Principal;
    shares : Nat;
    pricePerShare : Nat;
    totalCost : Nat;
    aiApproved : Bool;
    mlApproved : Bool;
    settled : Bool;
  };

  // =====================================================
  // STABLE STORAGE
  // =====================================================

  stable var balancesUSDEntries : [(Principal, Nat)] = [];
  stable var balancesNVDAEntries : [(Principal, Nat)] = [];
  stable var orderEntries : [(Nat, EscrowOrder)] = [];
  stable var nextOrderId : Nat = 0;

  // =====================================================
  // RUNTIME STATE (RBTree → no hashing issues)
  // =====================================================

transient let balances_sUSD = RBTree.RBTree<Principal, Nat>(Principal.compare);
transient let balances_sNVDA = RBTree.RBTree<Principal, Nat>(Principal.compare);
transient let orders = RBTree.RBTree<Nat, EscrowOrder>(Nat.compare);

  // =====================================================
  // UPGRADE HOOKS
  // =====================================================

  system func preupgrade() {
    balancesUSDEntries := Iter.toArray(balances_sUSD.entries());
    balancesNVDAEntries := Iter.toArray(balances_sNVDA.entries());
    orderEntries := Iter.toArray(orders.entries());
  };

  system func postupgrade() {
    for ((k,v) in balancesUSDEntries.vals()) { balances_sUSD.put(k,v) };
    for ((k,v) in balancesNVDAEntries.vals()) { balances_sNVDA.put(k,v) };
    for ((k,v) in orderEntries.vals()) { orders.put(k,v) };
  };

  // =====================================================
  // 1. FAUCET
  // =====================================================

  public shared(msg) func faucet() : async Text {
    let caller = msg.caller;

    balances_sUSD.put(
      caller,
      Option.get(balances_sUSD.get(caller), 0) + 10000
    );

    balances_sNVDA.put(
      caller,
      Option.get(balances_sNVDA.get(caller), 0) + 500
    );

    "Faucet funded"
  };

  // =====================================================
  // 2. BALANCE CHECK
  // =====================================================

  public query func getBalances(user : Principal) : async (Nat, Nat) {
    (
      Option.get(balances_sUSD.get(user), 0),
      Option.get(balances_sNVDA.get(user), 0)
    )
  };

  // =====================================================
  // 3. CREATE ESCROW ORDER
  // =====================================================

  public shared(msg) func createEscrowOrder(
    seller : Principal,
    shares : Nat,
    pricePerShare : Nat
  ) : async Nat {

    let buyer = msg.caller;
    let totalCost = shares * pricePerShare;

    let buyerUSD = Option.get(balances_sUSD.get(buyer), 0);
    let sellerNVDA = Option.get(balances_sNVDA.get(seller), 0);

    if (buyerUSD < totalCost) return 0;
    if (sellerNVDA < shares) return 0;

    // lock funds
    balances_sUSD.put(buyer, buyerUSD - totalCost);
    balances_sNVDA.put(seller, sellerNVDA - shares);

    let id = nextOrderId;
    nextOrderId += 1;

    orders.put(id, {
      buyer = buyer;
      seller = seller;
      shares = shares;
      pricePerShare = pricePerShare;
      totalCost = totalCost;
      aiApproved = false;
      mlApproved = false;
      settled = false;
    });

    id
  };

  // =====================================================
  // 4. AI APPROVAL
  // =====================================================

  public func approveByAI(orderId : Nat) : async Text {
    switch (orders.get(orderId)) {
      case null { "Order not found" };
      case (?o) {
        orders.put(orderId, {
          o with aiApproved = true
        });
        "AI approved"
      };
    }
  };

  // =====================================================
  // 5. ML APPROVAL
  // =====================================================

  public func approveByML(orderId : Nat) : async Text {
    switch (orders.get(orderId)) {
      case null { "Order not found" };
      case (?o) {
        orders.put(orderId, {
          o with mlApproved = true
        });
        "ML approved"
      };
    }
  };

  // =====================================================
  // 6. FINAL SETTLEMENT
  // =====================================================

  public func settleOrder(orderId : Nat, zkProofHash : Text) : async Text {
    switch (orders.get(orderId)) {

      case null { "Order not found" };

      case (?o) {

        if (o.settled) return "Already settled";
        if (not (o.aiApproved and o.mlApproved))
          return "❌ Awaiting dual green light";

        balances_sUSD.put(
          o.seller,
          Option.get(balances_sUSD.get(o.seller), 0) + o.totalCost
        );

        balances_sNVDA.put(
          o.buyer,
          Option.get(balances_sNVDA.get(o.buyer), 0) + o.shares
        );

        orders.put(orderId, { o with settled = true });

        "✅ Settlement complete | ZK: " # zkProofHash
      };
    }
  };

  // =====================================================
  // 7. VIEW ORDER
  // =====================================================

  public query func getOrder(orderId : Nat) : async ?EscrowOrder {
    orders.get(orderId)
  };
}