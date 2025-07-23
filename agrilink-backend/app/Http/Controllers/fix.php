$query = Delivery::with(['order.user', 'logisticsManager']);

// Filter by assigned logistics manager
if (auth()->user()->role === 'logistics') {
    $query->where('assigned_to', auth()->id());
}

// 🔽 Add this block right here
if (auth()->user()->role === 'retailer' || auth()->user()->role === 'consumer') {
    $query->whereHas('order', function ($q) {
        $q->where('user_id', auth()->id());
    });
}
// 🔼 End of inserted block

// Filter by status
if ($request->has('status') && $request->status) {
    $query->where('status', $request->status);
}
