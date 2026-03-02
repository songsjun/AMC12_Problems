# 2017 AMC 12B Problem 21

## Problem
Last year, Isabella took 7 math tests and received 7 different scores, each an integer between 91 and 100, inclusive. After each test she noticed that the average of her test scores was an integer. Her score on the seventh test was 95. What was her score on the sixth test?

$\textbf{(A)}\ 92\qquad\textbf{(B)}\ 94\qquad\textbf{(C)}\ 96\qquad\textbf{(D)}\ 98\qquad\textbf{(E)}\ 100$
## Solution 1(FAST)
First, remove all the $90s$, since they make no impact. So, we have numbers from 1 to 10. Then, 5 is the 7th number. Let the sum of the first 6 numbers be k. Then, $k\equiv 0 \mod 6$ and $k\equiv 2 \mod 7.$ We easily solve this as k $\equiv 30 \mod 42.$ Clearly, the sum of the first 6 numbers must be 570. In order for the first 5 numbers to sum to a multiple of 5, the sixth number must also be a multiple of 5, since 30 is a multiple of 5. Thus, the only option is the sixth number is 10, which gives $10+90=\boxed{\textbf{(E) }100}$

*~firebolt360*
## Solution 2
Let us simplify the problem. Since all of Isabella's test scores can be expressed as the sum of 90 and an integer between 1 and 10, we rewrite the problem into receiving scores between 1 and 10. Later, we can add 90 to her score to obtain the real answer.

From this point of view, the problem states that Isabella's score on the seventh test was 5. We note that Isabella received 7 integer scores out of 1 to 10. Since 5 is already given as the seventh test score, the possible scores for Isabella on the other six tests are S={1,2,3,4,6,7,8,9,10}.

The average score for the seven tests must be an integer. In other words, six distinct integers must be picked from set S above, and their sum with 5 must be a multiple of 7. The interval containing the possible sums of the six numbers in S are from $1 +2+3+4+6+7=23 to 4+6+7+8+9+10=44$. We must now find multiples of 7 from the interval $23+5 = 28 to 44+5=49$. There are four possibilities: 28, 35, 42, 49.
However, we also note that the sum of the six numbers (besides 5) must be a multiple of 6 as well. Thus, 35 is the only valid choice.(The six numbers sum to 30.)

Thus the sum of the six numbers equals to 30. We apply the logic above in a similar way for the sum of the scores from the first test to the fifth test. The sum must be a multiple of 5. The possible interval is from $1+2+3+4+6=16 to 6+7+8+9+10=40$. Since the sum of the five scores must be less than 30, the only possibilities are 20 and 25. However, we notice that 25 does not work because the seventh score turns out to be 5 from the calculation. Therefore, the sum of Isabella's scores from test 1 to 5 is 20. Therefore, her score on the sixth test is 10.
Our final answer is $10+90=\boxed{\textbf{(E) }100}.$
## Solution 3
Let n be Isabella's average after 6 tests. $6n+95\equiv 0 \pmod{7},$ so n $\equiv 4 \pmod{7}.$ The only integer between 90 and 100 that satisfies this condition is 95. Let m be Isabella's average after 5 tests, and let a be her sixth test score. $5m+a=6\cdot95 \equiv 0 \pmod{5},$ so a is a multiple of 5. Since 100 is the only choice that is a multiple of 5, the answer is $\boxed{\textbf{(E) }100}.$
## Solution 4
Let T be the total sum of Isabella's first five test scores, and let S be her score on the sixth test. It follows that T$\equiv 0\pmod$ {5}, T+S$\equiv 0\pmod$ {6}, and T+S+$95\equiv 0\pmod$ {7}, since at each step, her average score was an integer. Using the last equivalence, T+S$\equiv -95\equiv 3\pmod{7},$ so we have a system of equivalences for T+S. Solving this using the Chinese Remainder Theorem, we get T+S$\equiv (0)(7)(1)+(3)(6)(-1) \equiv -18 \equiv 24 \pmod{42}.$

Now let's put a bound on T. Using the given information that each test score was a distinct integer from 91 to 100 inclusive and that the seventh score was 95, we get $91+92+93+94+96\leq T\leq 100+99+98+97+96.$ Since T$\equiv 0 \pmod{5},$ we get T=470,475,480,485,490. Therefore, T$\equiv 8,13,18,23,28\pmod{42}$

The last preparation step will involve calculating all the possible test scores $\pmod$ {42}. Here they are:
$91\equiv 7\pmod{42},92\equiv 8\pmod{42},93\equiv 9\pmod{42},94\equiv 10\pmod{42},95\equiv 11\pmod{42},96\equiv 12\pmod{42},97\equiv 13\pmod{42},98\equiv 14\pmod{42},99\equiv 15\pmod{42},100\equiv 16\pmod{42}.$ This means that S$\equiv 7,8,9,10,12,13,14,15,16\pmod{42}.$ Note that 11 is not in the previous list because it corresponds to a score of 95, which we cannot have.

We must have T+S$\equiv 24\pmod{42},$ and using the possible values we found for T and S, the only two that sum to 24 are T$\equiv 8\pmod{42}$ and S$\equiv 16\pmod{42}.$ This corresponds to an S value of 100, so the answer is $\boxed{\bold{(E)} 100}.$
## Solution 5
We know that Isabella's score on the 7th test is 95, and we work backwards. Let $a_n$ denote the average of the first n scores. We are given that all $a_n$ are integers. If the $a_6$ is different from the $a_7$, then the last score must be a multiple of 7 away from $a_6$. However, $95-7=88$ and $95+7=102$ clearly cannot be $a_6$ since they are outside the range of 91 to 100. Thus, $a_6$ must be 95. Additionally, $a_5$ cannot be 95 since that would mean the sixth score is 95, which isn't possible since scores can't repeat (also, it's not an answer choice). Intuitively, $a_5$ should be close to 95 due to the constraint on the range of scores. We can try 94 and 96 for $a_5$. Again, the sixth score must be a multiple of 6 (preferably only one multiple) away from $a_5$. The only one that works is $94+6=100$, and we can check that the rest don't work since they exceed the range. The answer is $\boxed{\bold{(E)} 100}.$

- Lingjun :)
## Solution 6
Say the sum of the first 6 scores is n. Then, we know that n + 95 $\equiv 0 \pmod{7}.$ Thus, n $\equiv 3 \pmod{7}.$ Additionally, since the average of these 6 scores was an integer, we know that n $\equiv 0 \pmod{6}.$ We find that the smallest n to satisfy both of these inequalities is 24 (series below). 3, 10, 17, 24, ... To get to the next one, we have to add 6 $\cdot 7 = 42$ so as not to ruin the moduli.

Next, we know that n is between 91 $\cdot 6 = 546$ and 100 $\cdot 6 = 600.$ It can't take on either value as all the scores have to be different. Now, we calculate the first n that satisfies both moduli equations:

$546 < 42+24x$
$91 < 7+4x$
$84 < 4$x
21 < x

$x = 22$ works while $x = 23$ does not (as it hits the upper limit of 600), and we find that $n = 42 + 24 \cdot 22 = 570.$ So, the sum of the first 6 scores is 570. We also know that the sum of the first 5 scores is a multiple of 5. Since 5~\mid~570, the 6th score must be a multiple of 5. 95 is taken, so the only possibility $\boxed{\bold{(E)} 100}.$
## See Also
