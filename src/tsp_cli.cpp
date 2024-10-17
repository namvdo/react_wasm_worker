#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <limits>
#include <random>

struct Point {
    int x;
    int y;
};

// Function to calculate the Euclidean distance between two points
double distance(const Point& p1, const Point& p2) {
    return std::sqrt((p1.x - p2.x) * (p1.x - p2.x) * 1.0 + (p1.y - p2.y) * (p1.y - p2.y) * 1.0);
}

// Function to generate n random points on a 200x200 grid
std::vector<Point> generateRandomPoints(int n) {
    std::vector<Point> points;
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 199);

    for (int i = 0; i < n; ++i) {
        points.push_back({dis(gen), dis(gen)});
    }

    return points;
}

// Function to solve the Traveling Salesman Problem using brute force
std::vector<Point> tsp(const std::vector<Point>& points) {
    int n = points.size();
    std::vector<int> indices(n);
    for (int i = 0; i < n; ++i) {
        indices[i] = i;
    }

    double min_path_length = std::numeric_limits<double>::infinity();
    std::vector<int> best_order;

    do {
        double current_path_length = 0;
        for (int i = 0; i < n - 1; ++i) {
            current_path_length += distance(points[indices[i]], points[indices[i + 1]]);
        }
        current_path_length += distance(points[indices[n - 1]], points[indices[0]]); // Return to the starting point

        if (current_path_length < min_path_length) {
            min_path_length = current_path_length;
            best_order = indices;
        }
    } while (std::next_permutation(indices.begin(), indices.end()));

    std::vector<Point> ordered_points;
    for (int idx : best_order) {
        ordered_points.push_back(points[idx]);
    }

    return ordered_points;
}

int main() {
    int n;
    std::cout << "Enter the number of points: ";
    std::cin >> n;

    if (n <= 0) {
        std::cerr << "Number of points must be greater than 0." << std::endl;
        return 1;
    }

    // Generate random points
    std::vector<Point> points = generateRandomPoints(n);

    // Solve TSP
    std::vector<Point> ordered_points = tsp(points);

    // Output the ordered list of points
    std::cout << "Optimal path order: " << std::endl;
    for (const auto& point : ordered_points) {
        std::cout << "(" << point.x << ", " << point.y << ")" << std::endl;
    }

    return 0;
}