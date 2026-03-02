# 2020 AMC 12A Problem 19

> This problem is the same as [2020 AMC 12A #19](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12A_Problems) and [2020 AMC 10A #21](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10A_Problems).
## Problem
There exists a unique strictly increasing sequence of nonnegative integers $a_1 < a_2 < … < a_k$ such that

$$\frac{2^{289}+1}{2^{17}+1} = 2^{a_1} + 2^{a_2} + … + 2^{a_k}.$$

What is $k?$

$\textbf{(A) } 117 \qquad \textbf{(B) } 136 \qquad \textbf{(C) } 137 \qquad \textbf{(D) } 273 \qquad \textbf{(E) } 306$
## Solution 1
First, substitute $2^{17}$ with $x$.
Then, the given equation becomes $\frac{x^{17}+1}{x+1}=x^{16}-x^{15}+x^{14}...-x^1+x^0$ by sum of powers factorization.
Now consider only $x^{16}-x^{15}$. This equals $x^{15}(x-1)=x^{15} \cdot (2^{17}-1)$.
Note that $2^{17}-1$ equals $2^{16}+2^{15}+...+1$, by difference of powers factorization (or by considering the expansion of $2^{17}=2^{16}+2^{15}+...+2^{2}+2 + 2$).
Thus, we can see that $x^{16}-x^{15}$ forms the sum of 17 different powers of 2.
Applying the same method to each of $x^{14}-x^{13}$, $x^{12}-x^{11}$, ... , $x^{2}-x^{1}$, we can see that each of the pairs forms the sum of 17 different powers of 2. This gives us $17 \cdot 8=136$.
But we must count also the $x^0$ term.
Thus, Our answer is $\boxed{\textbf{(C) } 137}$.

*~seanyoon777*
## Solution 2 (Intuitive)
Multiply both sides by $2^{17}+1$ to get

$$2^{289}+1=2^{a_1} + 2^{a_2} + … + 2^{a_k} + 2^{a_1+17} + 2^{a_2+17} + … + 2^{a_k+17}.$$


Notice that $a_1 = 0$, since there is a $1$ on the LHS. However, now we have an extra term of $2^{18}$ on the right from $2^{a_1+17}$. To cancel it, we let $a_2 = 18$. The two $2^{18}$'s now combine into a term of $2^{19}$, so we let $a_3 = 19$. And so on, until we get to $a_{18} = 34$. Now everything we don't want telescopes into $2^{35}$. We already have that term since we let $a_2 = 18 \implies a_2+17 = 35$. Everything from now on will automatically telescope to $2^{52}$. So we let $a_{19}$ be $52$.

As you can see, we will have to add $17a_n$'s at a time, then "wait" for the sum to automatically telescope for the next $17$ numbers, etc, until we get to $2^{289}$. We only need to add $a_n$'s between odd multiples of $17$ and even multiples. The largest even multiple of $17$ below $289$ is $\cdot16$, so we will have to add a total of $\cdot 8a_n$'s. However, we must not forget we let $a_1=0$ at the beginning, so our answer is $\cdot8+1 = \boxed{\textbf{(C) } 137}$.
## Solution 3
In order to shorten expressions, $\#$ will represent $16$ consecutive $0$s when expressing numbers. <br>
<br>
Think of the problem in binary. We have <br>
$\frac{1\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#1_2}{1\#1_2}$ <br>
Note that <br>
$(2^{17} + 1) (2^0 + 2^{34} + 2^{68} + \cdots + 2^{272}) = 2^0(2^{17} + 1) + 2^{34}(2^{17} + 1) + 2^{68}(2^{17} + 1) + \cdots 2^{272}(2^{17} + 1)$ <br>
$= 1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1_2$ <br>
and <br>
$(2^{17} + 1) (2^{17} + 2^{51} + 2^{85} + \cdots + 2^{255}) = 2^{17}(2^{17} + 1) + 2^{51}(2^{17} + 1) + 2^{85}(2^{17} + 1) + \cdots 2^{255}(2^{17} + 1)$ <br>
$= 1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#0_2$ <br>
<br>
Since <br>
$\phantom{=\ } 1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1_2$ <br>
$-\ \phantom{1\#} 1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#1\#0_2$ <br>
$= 1\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#0\#1_2$ <br>
this means that<br>
$(2^{17} + 1) (2^0 + 2^{34} + 2^{68} + \cdots + 2^{272}) - (2^{17} + 1) (2^{17} + 2^{51} + 2^{85} + \cdots + 2^{255}) = 2^{289} + 1$<br>
so <br>
$\frac{2^{289}+1}{2^{17}+1} = (2^0 + 2^{34} + 2^{68} + \cdots + 2^{272}) - (2^{17} + 2^{51} + 2^{85} + \cdots + 2^{255})$ <br>
$= 2^0 + (2^{34} - 2^{17}) + (2^{68} - 2^{51}) + \cdots + (2^{272} - 2^{255})$ <br>
<br>
Expressing each of the pairs of the form $2^{n + 17} - 2^n$ in binary, we have <br>
$\phantom{=\ } 1000000000000000000 \cdots 0_2$ <br>
$-\ \phantom{10000000000000000} 10 \cdots 0_2$ <br>
$= \phantom{1} 111111111111111110 \cdots 0_2$ <br>
or <br>
$2^{n + 17} - 2^n = 2^{n + 16} + 2^{n + 15} + 2^{n + 14} + \cdots + 2^{n}$ <br>
This means that each pair has $17$ terms of the form $2^n$. <br>
<br>
Since there are $8$ of these pairs, there are a total of $8 \cdot 17 = 136$ terms. Accounting for the $2^0$ term, which was not in the pair, we have a total of $136 + 1 = \boxed{\textbf{(C) } 137}$ terms. ~emerald_block
## Solution 4 (Similar to Solution 3)
We can first look at smaller similar cases in binary. We can treat the initial problem as $\frac{2^{n^2} + 1}{2^n + 1}$ where $n=17$. We can first look at the case $n=3$ or $\frac{2^9 + 1}{2^3 + 1}$, which is equivalent to $\frac{1000000001_2}{1001_2}$. If we do long division we find that this equals $111001_2$. Then we can also look at the case $n=5$ or $\frac{2^{25}+1}{2^5+1}$. Doing long division on this in binary gives us a quotient that is a repeating pattern of 5 zeros and 5 ones. This pattern does hold, as $\text{... n ones ...}1_2 * \text{... n-1 zeroes ...}01_2 = (10_2)^{2n} - 1$. Then at the end, there is a remainder of $\text{... n-1 zeroes ...}01_2$, which is the same as the denominator of the original fraction. Thus, for the original problem, there are $\frac{17-1}{2}$ repeats of 17 zeroes and 17 ones, giving $8 * 17 + 1 = \boxed{\textbf{(C) }137}$.
*~Hi2937*
## Solution 5 (Psychology)
The two answers that are close to each other are $136$ and $137$. Since it seems more likely to forget a case than to overcount something in this context, the right answer is most likely $\boxed{\textbf{(C) }137}$.
## Video Solutions
### Video Solution 1 (Simple)
https://youtu.be/f7FibYTNSm8

*~Education The Study of Everything*
### Video Solution 2 (Richard Rusczyk)
https://artofproblemsolving.com/videos/amc/2020amc10a/511
### Video Solution 3
https://www.youtube.com/watch?v=FsCOVzhjUtE&list=PLLCzevlMcsWNcTZEaxHe8VaccrhubDOlQ&index=3 ~ MathEx
### Video Solution 4
https://youtu.be/Ozp3k2464u4

*~IceMatrix*
### Video Solution 5
https://youtu.be/oDSLaQM6L1o

*~savannahsolver*
## See Also
