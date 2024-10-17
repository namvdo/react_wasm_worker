#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <algorithm>
#include <string>
#include <gmpxx.h> // GNU MP for arbitrary precision
#include <emscripten/bind.h> // Emscripten Bind

// Function to factor a number and return the factors
std::vector<mpz_class> factor(const mpz_class& n) {
    std::vector<mpz_class> small_factors;
    std::vector<mpz_class> large_factors;
    mpz_class i = 1;
    mpz_class sqrt_n;
    mpz_sqrt(sqrt_n.get_mpz_t(), n.get_mpz_t());

    for (; i <= sqrt_n; ++i) {
        if (n % i == 0) {
            small_factors.push_back(i);
            if (i != n / i) {
                large_factors.push_back(n / i);
            }
        }
    }

    // Combine small factors and large factors in ascending order
    small_factors.insert(small_factors.end(), large_factors.rbegin(), large_factors.rend());
    return small_factors;
}

// Function to filter prime factors from a list of factors
std::vector<mpz_class> filter_prime_factors(const std::vector<mpz_class>& factors) {
    std::vector<mpz_class> prime_factors;
    for (const auto& factor : factors) {
        if (factor == 1) continue;  // Skip 1 as it is not a prime factor
        bool is_prime = true;
        mpz_class sqrt_factor;
        mpz_sqrt(sqrt_factor.get_mpz_t(), factor.get_mpz_t());
        for (const auto& other_factor : factors) {
            if (other_factor == 1) continue; // Skip 1
            if (other_factor == factor) break;
            if (other_factor > sqrt_factor) break;
            if (factor % other_factor == 0) {
                is_prime = false;
                break;
            }
        }
        if (is_prime) {
            prime_factors.push_back(factor);
        }
    }
    return prime_factors;
}

// Function to generate a random number with a given number of digits and return the result as a string
std::string generate_and_factor(int digit_count) {
    if (digit_count <= 0) {
        return "Error: Number of digits must be positive.";
    }

    // Seed the random number generator
    std::srand(std::time(0));

    // Generate a random number with the specified number of digits
    std::string random_number_str;
    for (int i = 0; i < digit_count; ++i) {
        char digit = (i == 0) ? '1' + (std::rand() % 9) : '0' + (std::rand() % 10);
        random_number_str += digit;
    }
    mpz_class random_number(random_number_str);

    // Factor the random number
    std::vector<mpz_class> factors = factor(random_number);

    // Filter the prime factors
    std::vector<mpz_class> prime_factors = filter_prime_factors(factors);

    // Create the result string
    std::string result = "Number: " + random_number_str + "\nPrime Factors: ";
    for (const auto& factor : prime_factors) {
        result += factor.get_str() + " ";
    }
    return result;
}

EMSCRIPTEN_BINDINGS(my_module) {
    emscripten::function("generate_and_factor", &generate_and_factor);
}