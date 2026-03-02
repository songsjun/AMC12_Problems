# 2005 AMC 12A Problem 18

## Problem
Call a number "prime-looking" if it is composite but not divisible by 2, 3, or 5. The three smallest prime-looking numbers are 49, 77, and 91. There are 168 prime numbers less than 1000. How many prime-looking numbers are there less than 1000?


$$(\mathrm {A}) \ 100 \qquad (\mathrm {B}) \ 102 \qquad (\mathrm {C})\ 104 \qquad (\mathrm {D}) \ 106 \qquad (\mathrm {E})\ 108$$

## Solution
The given states that there are 168 prime numbers less than 1000, which is a fact we must somehow utilize. Since there seems to be no easy way to directly calculate the number of "prime-looking" numbers, we can apply [complementary counting](https://artofproblemsolving.com/wiki/index.php/complementary_counting). We can split the numbers from 1 to 1000 into several groups: $\{1\}$, $\{\mathrm{numbers\ divisible\ by\ 2 = S_2}\}$,  $\{\mathrm{numbers\ divisible\ by\ 3 = S_3}\}$,  $\{\mathrm{numbers\ divisible\ by\ 5 = S_5}\}$, $\{\mathrm{primes\ not\ including\ 2,3,5}\}$,  $\{\mathrm{prime-looking}\}$. Hence, the number of prime-looking numbers is 1000 - (168-3) - 1 - |$S_2\cup S_3 \cup S_5$| (note that 2,3,5 are primes).

We can calculate $S_2\cup S_3 \cup S_5$ using the [Principle of Inclusion-Exclusion](https://artofproblemsolving.com/wiki/index.php/Principle_of_Inclusion-Exclusion): (the values of |$S_$2| $\ldots$ and their intersections can be found quite easily)


$$|S_2 \cup S_3 \cup S_5| = |S_2| + |S_3| + |S_5| - |S_2 \cap S_3| - |S_3 \cap S_5| - |S_2 \cap S_5| + |S_2 \cap S_3 \cap S_5|$$


$$= 500 + 333 + 200 - 166 - 66 - 100 + 33 = 734$$

Substituting, we find that our answer is $1000 - 165 - 1 - 734 = 100\Longrightarrow \mathrm{(A)}.$
## See also
