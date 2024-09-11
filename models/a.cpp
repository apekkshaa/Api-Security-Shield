long getMinInstallments(std::vector<int> dataUsage, int k) {
    int n = dataUsage.size();
    long total_installments = 0;
    long leftover_bandwidth = 0;  

    for (int i = 0; i < n; i++) {
        long total_bandwidth = dataUsage[i] + leftover_bandwidth;

        long installments_today = total_bandwidth / k;
        total_installments += installments_today;

        leftover_bandwidth = total_bandwidth % k;
    }

    if (leftover_bandwidth > 0) {
        total_installments += 1;
    }

    return total_installments;
}
