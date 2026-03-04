"use client";

import { MdDelete, MdLocalOffer } from "react-icons/md";

function PlanTab({
  setConfirmAction,
  plans,
  currentTheme,
}: {
  setConfirmAction: any;
  plans: any[];
  currentTheme: any;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {plans.length > 0 ? (
        plans.map((plan) => (
          <div
            key={plan.id}
            className="relative flex flex-col border rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg bg-gradient-to-b from-white to-gray-50/50"
            style={{ borderColor: currentTheme.borderColor }}
          >
            <div
              className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
              style={{ color: currentTheme.primary }}
            ></div>

            <div className="flex justify-between items-start mb-4">
              <div
                className="font-bold text-lg"
                style={{ color: currentTheme.headingColor }}
              >
                {plan.name}
              </div>
              <button
                onClick={() => setConfirmAction({ type: "plan", id: plan.id })}
                className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
              >
                <MdDelete size={18} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-extrabold"
                  style={{ color: currentTheme.primary }}
                >
                  ${plan.price}
                </span>
                <span
                  className="text-xs font-bold uppercase opacity-60"
                  style={{ color: currentTheme.textColor }}
                >
                  /mo
                </span>
              </div>
            </div>

            <div
              className="mt-auto border-t pt-4"
              style={{ borderColor: currentTheme.borderColor }}
            >
              <p
                className="text-sm opacity-70 leading-relaxed"
                style={{ color: currentTheme.textColor }}
              >
                {plan.description ||
                  "Contains: Standard features, basic support, single user license."}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div
          className="col-span-full py-16 text-center border-2 border-dashed rounded-2xl flex flex-col items-center gap-3"
          style={{
            borderColor: currentTheme.borderColor,
            color: currentTheme.textColor,
          }}
        >
          <div className="p-4 rounded-full bg-black/5 opacity-50">
            <MdLocalOffer size={32} />
          </div>
          <span className="opacity-60 font-medium">
            No subscription plans active.
          </span>
        </div>
      )}
    </div>
  );
}

export default PlanTab;
