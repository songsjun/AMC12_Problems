# 2018 AMC 12B Problem 5

## Problem
How many subsets of $\{2,3,4,5,6,7,8,9\}$ contain at least one prime number?

$\textbf{(A) } 128 \qquad \textbf{(B) } 192 \qquad \textbf{(C) } 224 \qquad \textbf{(D) } 240 \qquad \textbf{(E) } 256$
## Solution 1
Since an element of a subset is either in or out, the total number of subsets of the 8-element set is 2^8 = 256. However, since we are only concerned about the subsets with at least 1 prime in it, we can use complementary counting to count the subsets without a prime and subtract that from the total. Because there are 4 non-primes, there are $2^8 -2^4 =\boxed{\textbf{(D) } 240}$ subsets with at least 1 prime.
## Solution 2
We can construct our subset by choosing which primes are included and which composites are included. There are $2^4-1$ ways to select the primes (total subsets minus the empty set) and $2^4$ ways to select the composites. Thus, there are $15\cdot16=\boxed{\textbf{(D) } 240}$ ways to choose a subset of the eight numbers.
## Solution 3
We complement count. We know that we have $2^8$ subsets in all, including the empty subset. We subtract $\dbinom{4}{0}+\dbinom{4}{1}+\dbinom{4}{2}+\dbinom{4}{3}+\dbinom{4}{4} = 2^4 = 16$ We have $2^8-16 = 256-16 =\boxed{\textbf{(D) }240}$ ways to choose a subset of the eight numbers that include a prime number. ~hh99754539
## Video Solution by OmegaLearn
https://youtu.be/8WrdYLw9_ns?t=253

*~pi_is_3.14*
## Video Solution (HOW TO THINK CRITICALLY!!!)
https://youtu.be/3RPbjmksk6w

*~Education, the Study of Everything*
## See Also
