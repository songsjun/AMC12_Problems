# 2007 AMC 12A Problem 22

> This problem is the same as [2007 AMC 12A #22](https://artofproblemsolving.com/wiki/index.php/2007_AMC_12A_Problems) and [2007 AMC 10A #25](https://artofproblemsolving.com/wiki/index.php/2007_AMC_10A_Problems/Problem_25).
## Problem
For each positive integer n, let S(n) denote the sum of the digits of n. For how many values of n is n + S(n) + S(S(n)) = 2007?


$$\mathrm{(A)}\ 1 \qquad \mathrm{(B)}\ 2 \qquad \mathrm{(C)}\ 3 \qquad \mathrm{(D)}\ 4 \qquad \mathrm{(E)}\ 5$$

## Solution 1
For the sake of notation, let $T(n) = n$ + S(n) + S(S(n)). Obviously n<2007. Then the maximum value of S(n) + S(S(n)) is when $n = 1999$, and the sum becomes $28 + 10 = 38$. So the minimum bound is $2007-38=1969$. We do [casework](https://artofproblemsolving.com/wiki/index.php/casework) upon the tens digit:

Case 1: $196u\Longrightarrowu = 9$. Easy to directly disprove.

Case 2: $197u. S(n) = 1 + 9 + 7 + u = 17$ + u, and S(S(n)) = 8+u if u $\le 2$ and S(S(n)) = 2 + ($u-3) = u-1$ otherwise.

:Subcase a: $T(n) = $1970 + u + 17 + u + 8 + $u = 1995+3u = 2007 \Longrightarrowu = 4$. This exceeds our bounds, so no solution here.
:Subcase b: $T(n) = $1970 + u + 17 + u + u - 1 = 1986 + 3u = 2007 $\Longrightarrowu = 7$. First solution.

Case 3: $198u. S(n) = 18$ + u, and S(S(n)) = 9 + u if u $\le 1$ and 2 + $(u-2)$ = u otherwise.

:Subcase a: $T(n) = $1980 + u + 18 + u + 9 + $u = 2007+3u = 2007 \Longrightarrowu = 0$. Second solution.
:Subcase b: $T(n) = $1980 + u + 18 + u + $u = 1998+3u = 2007 \Longrightarrowu = 3$. Third solution.

Case 4: $199u$. But S(n) > 19, and n + S(n) clearly sum to > 2007.

Case 5: $200u. So S(n) = 2$ + u and S(S(n)) = 2 + u (recall that n < 2007 ), and 2000 + u + 2 + u + 2 + $u = 2004+3u = 2007 \Longrightarrowu = 1$. Fourth solution.

In total we have 4 $\mathrm{(D)}$ solutions, which are 1977, 1980, 1983,  and 2001.
## Solution 2
Clearly, n > 1950. We can break this into three cases:

Case 1: n $\geq 2000$

:Inspection gives $n = 2001$.

Case 2: n < 2000, n = $\overline{19xy},$ x + y < 10

:If you set up an equation, it reduces to

$$4x + y = 32$$

:which has as its only solution satisfying the constraints $x = 8, y = 0$.

Case 3: n < 2000, n = $\overline{19xy},$ x + y $\geq 10$

:This reduces to

:$4x+y = 35$. The only two solutions satisfying the constraints for this equation are $x = 7, y = 7$ and $x = 8, y = 3$.

The solutions are thus 1977, 1980, 1983, 2001 and the answer is $\mathrm{(D)}$\ 4.
## Solution 3 (Fastest casework)
It is well-known that n $\equiv S(n)\equiv S(S(n)) \pmod{9}.$ Substituting, we have that n+n+n $\equiv 2007 \pmod{9} \implies$ n $\equiv 0 \pmod{3}.$ Since n $\leq 2007,$ we must have that $\max S(n)=1+9+9+9=28.$ Now, we list out the possible values for S(n) in a table, noting that it is a multiple of 3 because n is a multiple of 3.


$$
\begin{tabular}{c|c c c c c c c c c c} S(n) & 0 & 3 & 6 & 9 & 12 & 15 & 18 & 21 & 24 & 27 \\ \end{tabular}
$$


Then, we compute the corresponding values of S(S(n)).


$$
\begin{tabular}{c|c c c c c c c c c c} S(n) & 0 & 3 & 6 & 9 & 12 & 15 & 18 & 21 & 24 & 27 \\ \hline S(S(n)) & 0 & 3 & 6 & 9 & 3 & 6 & 9 & 3 & 6 & 9 \\ \end{tabular}
$$


Finally, we may compute the corresponding values of n using the fact that $n=2007$-S(n)-S(S(n)).


$$
\begin{tabular}{c|c c c c c c c c c c} n & 2007 & 2001 & 1995 & 1989 & 1992 & 1986 & 1980 & 1983 & 1977 & 1971 \\ \hline S(n) & 0 & 3 & 6 & 9 & 12 & 15 & 18 & 21 & 24 & 27 \\ \hline S(S(n)) & 0 & 3 & 6 & 9 & 3 & 6 & 9 & 3 & 6 & 9 \\ \end{tabular}
$$


Notice how all conditions are designed to be satisfied except whether S(n) is accurate with respect to n. So, the only thing that remains is to check this. We may eliminate, for example, when $n=2007$ we have $S(n)=9$ while the table states that it is 0. Proceeding similarly, we obtain the following table.


$$
\begin{tabular}{c|c c c c c c c c c c} n & \cancel{2007} & \boxed{2001} & \cancel{1995} & \cancel{1989} & \cancel{1992} & \cancel{1986} & \boxed{1980} & \boxed{1983} & \boxed{1977} & \cancel{1971} \\ \hline S(n) & 0 & 3 & 6 & 9 & 12 & 15 & 18 & 21 & 24 & 27 \\ \hline S(S(n)) & 0 & 3 & 6 & 9 & 3 & 6 & 9 & 3 & 6 & 9 \\ \end{tabular}
$$


It follows that there are $\boxed{4}\implies \textbf{(D)}$ possible values for n. ~samrocksnature
## Solution 4
As in Solution 1, we note that S(n)$\leq 28$ and S(S(n))$\leq 10.$

Obviously, $n\equiv S(n)\equiv S(S(n)) \pmod 9.$

As $2007\equiv 0 \pmod 9,$ this means that $n\bmod 9 \in\{0,3,6\}$, or equivalently that $n\equiv S(n)\equiv S(S(n))\equiv 0 \pmod 3.$

Thus S(S(n))$\in\{3,6,9\}$. For each possible S(S(n)) we get three possible S(n).

(E. g., if S(S(n))=6, then $S(n)=x$ is a number such that $x\leq 28$ and $S(x)=6$, therefore S(n)$\in\{6,15,24\}$.)

For each of these nine possibilities we compute $n_{?}$ as 2007-S(n)-S(S(n)) and check whether S$(n_{?})$=S(n).

We'll find out that out of the 9 cases, in 4 the value $n_{?}$ has the correct sum of digits.

This happens for $n_{?}\in\{ 1977, 1980, 1983, 2001 \}$.
## Solution 5
Claim. The only positive integers n that satisfy the condition are perfect multiples of 3.

Proof of claim:
We examine the positive integers mod 9. Here are the cases.

Case 1. n $\equiv 1 \pmod 9.$ Now, we examine S(n) modulo 9.
Case 1.1. The tens digit of n is different from the tens digit of the largest multiple of 9 under n. (In other words, this means we will carry when adding from the perfect multiple of 9 under n.)
Observe that when we carry, i.e. Add 1 onto 1989 to obtain 1990, the units digit decreases by 9 while the tens digit increases by 1. This means that the sum of the digits decreases by 8 in total, and we have -8 $\equiv 1 \pmod 9,$ so the "mod 9" of the sum increases by 1. This means that, regardless of whether the sum carries or not, the modulo 9 of the sum of the digits always increases by 1.

Case 1.2. The tens digits are the same, which is trivial since the units digit just increases by 1 which means that the sum is also equivalent to 1 $\pmod 9.$

This means that S(n) $\equiv 1 \pmod 9$ and similarly letting the next n=S(n), S(S(n)) $\equiv 1 \pmod 9.$ Summing these, we have n+S(n)+S(S(n)) $\equiv 3 \pmod 9.$ Clearly, no integers of this form will satisfy the condition because 2007 is a perfect multiple of 9.

Case 2. n $\equiv 2 \pmod 9.$

In this case, we apply exactly the same argument. There is at most one carry, which means that the sum of the digits will always be congruent to 2 mod 9. Then we can apply similar arguments to get S(n) $\equiv 2 \pmod 9$ and S(S(n)) $\equiv 2 \pmod 9,$ so adding gives n+S(n)+S(S(n)) $\equiv 6 \pmod 9.$

It is trivial to see that for n $\equiv$ k $\pmod 9,$ for 0 $\leq$ k $\leq 8,$ we must have n+S(n)+S(S(n)) $\equiv 3k \pmod 9.$ Only when $k=0$, 3, 6 is $3k$ a multiple of 9, which means that n must be a multiple of 3.

Now, we find the integers. Again, consider two cases: Integers that are direct multiples of 9 and integers that are multiples of 3 but not 9.

Case 1. n is a multiple of 9. An integer of the form $\overline{20ab}$ will not work since the least such integer is 2007 which already exceeds our bounds. Thus, we need only consider the integers of the form $\overline{19ab}.$ The valid sums of the digits of n are 18 and 27 in this case.

Case 1.1. The sum of the digits is 18. This means that $S(n)=18$, S(S(n))=9, so $n=2007-18-9=1980$. Clearly this number satisfies our constraints.

Case 1.2. The sum of the digits is 27. This means that $S(n)=27$, S(S(n))=9, ,so $n=2007-27-9=1971$. Since the sum of the digits of 1971 is not 27, this does not work.

This means that there is 1 integer in this case.

Case 2. n is a multiple of 3, not 9.
.
Case 2.1. Integers of the form $\overline{20ab}.$ Then $S(n)=3$ or $S(n)=6$; it is trivial to see that $S(n)=6$ exceeds our bounds, so $S(n)=3$ and $n=2007-6=2001$.

Case 2.2. Integers of the form $\overline{19ab}.$ Then $S(n)=12$, 15, 21, 24 and we consider each case separately.

Case 2.2.1. Integers with $S(n)=12.$ That means $n=2007-12-3=1992$ which clearly does not work.

Case 2.2.2. Integers with $S(n)=15.$ That means $n=2007-15-6=1986$ which also does not work

Case 2.2.3. Integers with $S(n)=21.$ That means $n=2007-21-3=1983$ which is valid.

Case 2.2.4. Integers with $S(n)=24.$ That means $n=2007-24-6=1977$ which is also valid.

We have considered every case, so there are $\boxed{4}$ integers that satisfy the given condition.

*~Refined by HamstPan38825*
## Solution 6 (Rigorous)
Let the number of digits of n be m. If $m = 5$, n will already be greater than 2007. Notice that S(n) is always at most $9m$. Then if $m = 3$, n will be at most 999, S(n) will be at most 27, and S(S(n)) will be even smaller than 27. Clearly we cannot reach a sum of 2007, unless $m = 4$ (i.e. n has 4 digits).

Then, let n be a four digit number in the form $1000a+100b + 10c$ + d. Then $S(n) = a$ + b + c + d.

S(S(n)) is the sum of the digits of a + b + c + d. We can represent S(S(n)) as the sum of the tens digit and the ones digit of S(n). The tens digit in the form of a decimal is

$$\frac{a + b + c + d}{10}.$$

To remove the decimal portion, we can simply take the floor of the expression,

$$\lfloor\frac{a + b + c + d}{10}\rfloor.$$

Now that we have expressed the tens digit, we can express the ones digit as S(n) -10 times the above expression, or

$$a + b + c + d - 10\lfloor\frac{a + b + c + d}{10}\rfloor.$$

Adding the two expressions yields the value of S(S(n))

$$= a + b + c + d - 9\lfloor\frac{a + b + c + d}{10}\rfloor.$$

Combining this expression to the ones for n and S(n) yields

$$1002a + 102b + 12c + 3d - 9\lfloor\frac{a + b + c + d}{10}\rfloor.$$

Setting this equal to 2007 and rearranging a bit yields

$$12c + 3d = 2007 - 1002a - 102b + 9\lfloor\frac{a + b + c + d}{10}\rfloor$$


$$\Rightarrow 4c + d = 669 - 334a - 34b + 3\lfloor\frac{a + b + c + d}{10}\rfloor.$$


(The reason for this slightly weird arrangement will soon become evident)

Now we examine the possible values of a. If a $\ge 3,$ n is already too large. a must also be greater than 0, or n would be a 3-digit number. Therefore, $a = $1 \, $\text{or}$ \, 2. Now we examine by case.

If $a = 2$, then b and c must both be 0 (otherwise n would already be greater than 2007). Substituting these values into the equation yields

$$d = 1 + 3\lfloor\frac{2 + d}{10}\rfloor$$

$$\Rightarrow d=1.$$

Sure enough, 2001 + (2+1) + 3=2007.

Now we move onto the case where $a = 1$. Then our initial equation simplifies to

$$4c + d = 335 - 34b + 3\lfloor\frac{1 + b + c + d}{10}\rfloor$$

Since c and d can each be at most 9, we substitute that value to find the lower bound of b. Doing so yields

$$34b \ge 290 + 3\lfloor\frac{19 + b}{10}\rfloor.$$

The floor expression is at least $3\lfloor\frac{19}{10}\rfloor=3$ , so the right-hand side is at least 293. Solving for b, we see that b $\ge 9  \Rightarrowb=9$. Again, we substitute for b and the equation becomes

$$4c + d = 29 + 3\lfloor\frac{10 + c + d}{10}\rfloor$$

$$\Rightarrow 4c + d = 32 + 3\lfloor\frac{c + d}{10}\rfloor.$$

Just like we did for b, we can find the lower bound of c by assuming $d = 9$ and solving:

$$4c + 9 \ge 29 + 3\lfloor\frac{c + 9}{10}\rfloor$$

$$\Rightarrow 4c \ge 20 + 3\lfloor\frac{c + 9}{10}\rfloor$$

The right hand side is 20 for $c=0$ and 23 for c $\ge 1.$ Solving for c yields c $\ge 6.$ Looking back at the previous equation, the floor expression is 0 for c+d $\le 9$ and 3 for c+d $\ge 10.$ Thus, the right-hand side is 32 for c+d $\le 9$ and 35 for c+d $\ge 10.$ We can solve these two scenarios as systems of equations/inequalities:

$$4c+d = 32$$

$$c+d \le 9$$

and

$$4c+d=35$$

$$c+d \ge 10$$

Solving yields three pairs (c, d): (8, 0); (8, 3); and (7, 7). Checking the numbers 1980, 1983, and 1977; we find that all three work. Therefore there are a total of 4 possibilities for n $\Rightarrow \boxed{\text{D}}.$

Note: Although this solution takes a while to read (as well as to write) the actual time it takes to think through the process above is very short in comparison to the solution length.

*~edits by vadava_lx*
## See also
