# 2020 AMC 12B Problem 24

> This problem is the same as [2020 AMC 10B #25](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #24](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
Let $D(n)$ denote the number of ways of writing the positive integer $n$ as a product

$$n = f_1\cdot f_2\cdots f_k,$$

where $k\ge1$, the $f_i$ are integers strictly greater than $1$, and the order in which the factors are listed matters (that is, two representations that differ only in the order of the factors are counted as distinct). For example, the number $6$ can be written as $6$, $\cdot 3$, and $\cdot2$, so $D(6) = 3$. What is $D(96)$?

$\textbf{(A) } 112 \qquad\textbf{(B) } 128 \qquad\textbf{(C) } 144 \qquad\textbf{(D) } 172 \qquad\textbf{(E) } 184$
## Solution 1
Note that $96 = 2^5 \cdot 3$. Since there are at most six not necessarily distinct factors $>1$ multiplying to $96$, we have six cases: $k=1, 2, ..., 6.$ Now we look at each of the six cases.


$k=1$: We see that there is $1$ way, merely $96$.

$k=2$: This way, we have the $3$ in one slot and $2$ in another, and symmetry. The four other $2$'s leave us with $5$ ways and symmetry doubles us so we have $10$.

$k=3$: We have $3, 2, 2$ as our baseline. We need to multiply by $2$ in $3$ places, and see that we can split the remaining three powers of $2$ in a manner that is $3-0-0$, $2-1-0$ or $1-1-1$. A $3-0-0$ split has $6 + 3 = 9$ ways of happening ($24-2-2$ and symmetry; $2-3-16$ and symmetry), a $2-1-0$ split has $6 \cdot 3 = 18$ ways of happening (due to all being distinct) and a $1-1-1$ split has $3$ ways of happening ($6-4-4$ and symmetry) so in this case we have $9+18+3=30$ ways.

$k=4$: We have $3, 2, 2, 2$ as our baseline, and for the two other $2$'s, we have a $2-0-0-0$ or $1-1-0-0$ split. The former grants us $4+12=16$ ways ($12-2-2-2$ and symmetry and $3-8-2-2$ and symmetry) and the latter grants us also $12+12=24$ ways ($6-4-2-2$ and symmetry and $3-4-4-2$ and symmetry) for a total of $16+24=40$ ways.

$k=5$: We have $3, 2, 2, 2, 2$ as our baseline and one place to put the last two: on another two or on the three. On the three gives us $5$ ways due to symmetry and on another two gives us $5 \cdot 4 = 20$ ways due to symmetry. Thus, we have $5+20=25$ ways.

$k=6$: We have $3, 2, 2, 2, 2, 2$ and symmetry and no more twos to multiply, so by symmetry, we have $6$ ways.


Thus, adding, we have $\boxed{\textbf{(A) } 112}$.

*~kevinmathz*
## Solution 2
As before, note that $\cdot3$, and we need to consider 6 different cases, one for each possible value of $k$, the number of factors in our factorization. However, instead of looking at each individually, find a general form for the number of possible factorizations with $k$ factors. First, the factorization needs to contain one factor that is itself a multiple of $3$. There are $k$ to choose from. That leaves $k-1$ slots left to fill, each of which must contain at least one factor of $2$. Once we have filled in a $2$ to each of the remaining slots, we're left with $5-(k-1)=6-k$ twos.

Consider the remaining $6-k$ factors of $2$ left to assign to the $k$ factors. Using stars and bars, the number of ways to do this is:


$${{(6-k)+k-1}\choose{6-k}}={5\choose{6-k}}$$

 This makes $k{\choose{6-k}}$ possibilities for each k.

To obtain the total number of factorizations, add all possible values for k:

$$\sum_{k=1}^6 k{5\choose{6-k}}=1+10+30+40+25+6=\boxed{\textbf{(A) } \text{112}}.$$


*~Continuous_Pi*
## Solution 3
Begin by examining $f_1. f_1$ can take on any value that is a factor of $96$ except $1$. For each choice of $f_1$, the resulting $f_2...f_k$ must have a product of $96/f_1$. This means the number of ways the rest $f_a$, $1<a<=k$ can be written by the scheme stated in the problem for each $f_1$ is equal to $D(96/f_1)$, since the product of $f_2 \cdot f_3... \cdot f_k=x$ is counted as one valid product if and only if $f_1 \cdot x=96$, the product $x$ has the properties that factors are greater than $1$, and differently ordered products are counted separately.

For example, say the first factor is $2$. Then, the remaining numbers must multiply to $48$, so the number of ways the product can be written beginning with $2$ is $D(48)$. To add up all the number of solutions for every possible starting factor, $D(96/f_1)$ must be calculated and summed for all possible $f_1$, except $96$ and $1$, since a single $1$ is not counted according to the problem statement. The $96$ however, is counted, but only results in $1$ possibility, the first and only factor being $96$. This means

$D(96)=D(48)+D(32)+D(24)+D(16)+D(12)+D(8)+D(6)+D(4)+D(3)+D(2)+1$.

Instead of calculating D for the larger factors first, reduce $D(48)$, $D(32)$, and $D(24)$ into sums of $D(m)$ where $m<=16$ to ease calculation. Following the recursive definition $D(n)=($sums of $D(c))+1$ where c takes on every divisor of n except for 1 and itself, the sum simplifies to

$D(96)=(D(24)+D(16)+D(12)+D(8)+D(6)+D(4)+D(3)+D(2)+1)$
+$(D(16)+D(8)+D(4)+D(2)+1)+D(24)+D(16)+D(12)+D(8)+D(6)+D(4)+D(3)+D(2)+1.$

$D(24)=D(12)+D(8)+D(6)+D(4)+D(3)+D(2)+1$, so the sum further simplifies to

$D(96)=3D(16)+4D(12)+5D(8)+4D(6)+5D(4)+4D(3)+5D(2)+5$, after combining terms. From quick casework,

$D(16)=8, D(12)=8, D(8)=4, D(6)=3, D(4)=2, D(3)=1$ and $D(2)=1$. Substituting these values into the expression above,

$D(96)=3 \cdot 8+4 \cdot 8+5 \cdot 4+4 \cdot 3+5 \cdot 2+4 \cdot 1+5 \cdot 1+5=\boxed{\textbf{(A) } 112}$.

*~monmath a.k.a Fmirza*
## Solution 4
Note that $96 = 3 \cdot 2^5$, and that $D$ of a perfect power of a prime is relatively easy to calculate. Also note that you can find $D(96)$ from $D(32)$ by simply totaling the number of ways there are to insert a $3$ into a set of numbers that multiply to $32$.

First, calculate $D(32)$. Since $32 = 2 \cdot 2 \cdot 2 \cdot 2 \cdot 2$, all you have to do was find the number of ways to divide the $2$'s into groups, such that each group has at least one $2$. By stars and bars, this results in $1$ way with five terms, $4$ ways with four terms, $6$ ways with three terms, $4$ ways with two terms, and $1$ way with one term. (The total, $16$, is not needed for the remaining calculations.)

Then, to get $D(96)$, in each possible $D(32)$ sequence, insert a $3$ somewhere in it, either by placing it somewhere next to the original numbers (in one of $n+1$ ways, where $n$ is the number of terms in the $D(32)$ sequence), or by multiplying one of the numbers by $3$ (in one of $n$ ways). There are $2+1=3$ ways to do this with one term, $3+2=5$ with two, $7$ with three, $9$ with four, and $11$ with five.

The resulting number of possible sequences is $3 \cdot 1 + 5 \cdot 4 + 7 \cdot 6 + 9 \cdot 4 + 11 \cdot 1 = \boxed{\textbf{(A) }112}$. ~emerald_block
## Solution 5 (Minimal Casework)
Consider the arrangement of the prime factors of 96 in a line $(2,2, 2, 2, 2, 3)$.  An arrangement of factors can be created by placing "dividers" to group primes.  For example, $(2, 2, |, 2, 2, 2, |, 3)$ is equivalent to the arrangement $4 \cdot 8 \cdot 3$.  Because there are $6$ ways to order the prime factors, and $2^5$ ways to place dividers, this gives us an initial $6 \cdot  2^5$ ways to arrange divisors.

However, through this method, we overcount cases where $3$ is combined with another factor.  For example, the arrangement $4 \cdot 6 \cdot 4$ can be written as $(2, 2, |, 2, 3, |, 2, 2)$ or $(2, 2, |, 3, 2, |, 2, 2)$.  Precisely, we double count any case with $6$ as a factor, triple count any case with $12$, quadruple count any case with $24$, etc.

Now, consider all cases where $3$ must be grouped with at least one $2$.  This can be expressed in the same "line" format as $(2, 2, 2, 2, 6)$, where dividers can again be placed to group divisors.  In this case, there are $5$ ways to order divisors, and $2^4$ ways to place dividers, so we have an $5 \cdot 2^4$ possible sequences for this case.  Notice that in this format, we double count cases where $12$ is a factor, we triple count cases where $24$ is a factor, etc.  Precisely, for any case counted $n$ times in the first step, it is counted $n - 1$ times in this step.  Thus, if we subtract, we count each case exactly once.

So, we get:

$6 \cdot  2^5 - 5 \cdot 2^4 = \boxed{\textbf{(A) }112}$. ~hdai1122
## Solution 6 (Another Fast Way)
First we factor $32$ into $m$ numbers $g_1, \cdots, g_m$ where $g_i>1,i=1,\ldots,m$. By applying stars and bars there are $\binom{5-1}{m-1}$ ways. Then we can either insert $3$ into each of the $m+1$ spaces between (or beyond) $g_i$'s, or multiply it to one of the $g_i$'s, a total of $2m+1$ ways. Hence the answer to the problem is


$$\sum_{m=1}^5 (2m+1)\binom{5-1}{m-1} = \sum_{n=0}^4 (2n+3) \binom{4}{n} = 8\sum_{n=0}^4 \frac{n}{4} \binom{4}{n} + 3 \sum_{n=0}^4 \binom{4}{n} = 8 \sum_{n=0}^4 \binom{3}{n-1} + 3\sum_{n=0}^4 \binom{4}{n} = 8 \cdot 2^3 + 3\cdot 2^4 = \boxed{\textbf{(A) }112}.$$


*~asops*
## Solution 7 (Integer Partition)
Note that $96 = 2^5 \cdot 3. D(n)$ depends on dividing $2^5$ into different terms, which is the [https://en.wikipedia.org/wiki/Partition_(number_theory) integer partition] of $5$.

Divide $96$ into $1$ term:

There is only one way. $\underline{\textbf{1}}$


Divide $96$ into $2$ terms:

 Case $1$: $3$ is alone
 $(2^5,3)$ has ${\textbf{2}}$ different arrangements.

 Case $2$: $3$ is with $2^n$
 $5 = 1 + 4 = 2 + 3$. For $(2, 2^4)$ and $(2^2, 2^3)$, $3$ can be with any term from the $2$ tuples, and the number of  arrangement of the $2$ terms is $2$. $2 \cdot 2 \cdot 2 = {\textbf{8}}$

$2 + 8 = \underline{\textbf{10}}$


Divide $96$ into $3$ terms:

 Case $1$: $3$ is alone
 $5 = 2 + 3 = 1 + 4$. For $(2^2, 2^3, 3)$ and $(2, 2^4, 3)$, there are $3!$ arrangements each. $2 \cdot 3! = {\textbf{12}}$

 Case $2$: $3$ is with $2^n$
 $5 = 1 + 1 + 3 = 1 + 2 + 2$. For $(2, 2, 2^3)$ and $(2, 2^2, 2^2)$, $3$ can be with any term from the $2$ tuples. If $3$ is with $2^3$ for the first tuple, or $2$ for the second tuple, the number of arrangements is $3$ for each. If $3$ is with $2$ for the first tuple, or $2^2$ for the second tuple, the number of arrangements is $6$ for each. $2 \cdot 3 + 2 \cdot 6 = {\textbf{18}}$

$12 + 18 = \underline{\textbf{30}}$


Divide $96$ into $4$ terms:

 Case $1$: $3$ is alone
 $5 = 1 + 1 + 3 = 1 + 2 + 2$. For $(2, 2, 2^3, 3)$ and $(2, 2^2, 2^2, 3)$, there are $\frac{4!}{2!}$ arrangements each. $2 \cdot \frac{4!}{2!} = {\textbf{24}}$

 Case $2$: $3$ is with $2^n$
 $5 = 1 + 1 + 1 + 2$. For $(2, 2, 2, 2^2)$, $3$ can be with any term from the tuple. If $3$ is with $2^2$, the number of arrangements is $\frac{4!}{3!}$. If $3$ is with $2$, the number of arrangements is $\frac{4!}{2!}$.
 $\frac{4!}{3!} + \frac{4!}{2!} = {\textbf{16}}$

$24 + 16 = \underline{\textbf{40}}$


Divide $96$ into $5$ terms:

When dividing $5$ into $5$ parts there are $2$ cases.

 Case $1$: $3$ is alone
 $5 = 1 + 1 + 1 + 2$. For $(2, 2, 2, 2^2, 3)$, there are $\frac{5!}{3!}$ arrangements. $\frac{5!}{3!} = {\textbf{20}}$

 Case $2$: $3$ is with $2^n$
 $5 = 1 + 1 + 1 + 1 + 1$. For $(2, 2, 2, 2, 2)$, $3$ can only be with $2$. The number of arrangements is $\frac{5!}{4!} = \textbf{5}$

$20 + 5 = \underline{\textbf{25}}$


Divide $96$ into $6$ terms:

$5 = 1 + 1 + 1 + 1 + 1$. The number of arrangements of $(2, 2, 2, 2, 2, 3)$ is $\frac{6!}{5!} = \underline{\textbf{6}}$


$1 + 10 + 30 + 40 + 25 + 6 = \boxed{\textbf{(A) }112}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 8
Ignore the $3$ first and first count $2^{x_1+x_2+...+x^n}=32$ which $x_1+x_2+...+x_n=5$. This implies that $n$ is less than or equal to $5$. Now, we can see that $3$ can lie between the two $x_i, x_{i+1}$, or contribute to one of them. This gives $2k+1$ if $x_1+...+x_k=5$. Now, just sum up gives $\binom{5-1}{5-1}\cdot 11+\binom{5-1}{4-1}\cdot 9+\binom{5-1}{3-1}\cdot 7+\binom{5-1}{2-1}\cdot 5+\binom{5-1}{1-1}\cdot 3=\boxed{112}$.
## Solution 9 (Cleanest Algebra)
Consider how we partition the factors of $96 = \cdot 3$. For each $k$, there are two cases. Either we can put the $2$s into $k$ nonzero parts, so that the $3$ shares a partition with some $2$s, which can be done in $k\binom{5-(k-1)+(k-1)-1}{k-2} = \binom{4}{k-2}$ ways, or we can put the $2$s into $k-1$ nonzero parts and put the $3$ in its own partition, which can be done in $k\binom{5-k+k-1}{k-1} = \binom{4}{k-1}$ ways. Summing over all $k$, we have


$$\sum_{k=1}^6 k\binom{4}{k-2} + \sum_{k=1}^6 k\binom{4}{k-1}.$$



But $\sum_{k=1}^6 \binom{4}{k-2} = 2\binom{4}{0}+3\binom{4}{1} + \dots + 6\binom{4}{4} = 4 \cdot \sum_{i=0}^4 \binom{4}{i} = 4 \cdot 2^4 = 64$. Similarly, $\sum_{k=1}^6 \binom{4}{k-1} = 3\cdot 2^4 = 48$. So our answer is $64+48 = \boxed{\textbf{(A) }112}$.

*~InsetIowa9*
## Solution 10 (Word Arrangements and Brute Forcing)
After careful inspection we notice that for each respect value of k, there are a certain number of unique set of numbers that form total word arrangements. Using case work we can deduce that for each respective k value:

$k = 1$:
96

$k = 2$:
2 48,
3 32,
4 24,
6 16,
8 12

$k = 3$:
2 6 8,
2 3 16,
3 4 8,
2 4 12,
2 2 24,
4 4 6

$k = 4$:
2 2 3 8,
2 3 4 4,
2 2 2 12,
2 2 4 6

$k = 5$:
2 2 2 3 4,
2 2 2 2 6

$k = 6$:
2 2 2 2 2 3

Using the word arrangement formula ($\frac{n!}{f1!f2!...fn!}$, where $n$ is the total number of letters in the word, and $f$ is the frequency of each respective letter for instance in "aabc" the letter "a" has a frequency of 2, b has 1, and c has 1)  for each respective set of unique integers we obtain the sum $1 + 10 + 30 + 40 + 25 + 6 = 112 = \boxed{\textbf{(A) }112}$

*~PeterDoesPhysics*
## Solution 11 (Grid with Labels)
This question is like [2010 AMC 8 problem 25](https://artofproblemsolving.com/wiki/index.php/2010_AMC_8_Problems/Problem_25), if we treat each prime factor of $96 = 2^5 \cdot 3$ as a step, this is a recursive problem of climbing stairs.

The stair can be designed like

> [Asymptote diagram - not rendered in Markdown]

```asy
<asy> size(8cm); defaultpen(fontsize(10pt)); draw((0, 1) -- (5, 1) ^^ (1, 0) -- (1, 1) ^^ (2, 0) -- (2, 1) ^^ (3, 0) -- (3, 1) ^^ (4, 0) -- (4, 1) ^^ (5, 0) -- (5, 1)); draw((0, 2) -- (0, 0) -- (6, 0), Arrows); label("2", (6, 0), E); label("3", (0, 2), N); label("start", (0, 0), SW); label("end", (5, 1), NE);</asy>
```


In this grid, we can only take any number of steps to the right or up, so the number of each point is the sum of all numbers to its left and below it. We label the points to obtain number of paths.

> [Asymptote diagram - not rendered in Markdown]

```asy
<asy> size(8cm); defaultpen(fontsize(10pt)); draw((0, 1) -- (5, 1) ^^ (1, 0) -- (1, 1) ^^ (2, 0) -- (2, 1) ^^ (3, 0) -- (3, 1) ^^ (4, 0) -- (4, 1) ^^ (5, 0) -- (5, 1)); draw((0, 2) -- (0, 0) -- (6, 0), Arrows); label("2", (6, 0), E); label("3", (0, 2), N); label("start", (0, 0), SW); label("end", (5, 1), NE); label("1", (0, 0), NW); label("1", (1, 0), NW); label("2", (2, 0), NW); label("4", (3, 0), NW); label("8", (4, 0), NW); label("16", (5, 0), NW); label("1", (0, 1), NW); label("3", (1, 1), NW); label("8", (2, 1), NW); label("20", (3, 1), NW); label("48", (4, 1), NW); label("112", (5, 1), NW);</asy>
```


The result is $\boxed{\textbf{(A) }112}$

~[https://artofproblemsolving.com/wiki/index.php/User:Reda_mandymath reda_mandymath]
## Solution 12 (The simplest solution)
There are $2^4=16$ ways of placing (or not placing) $\times$’s between five $2$’s. These placements can be grouped into $8$ pairs such that in each pair, the total number of $\times$’s is $4$.

In each pair, there are $4+2=6$ powers of $2$ and $6+2=8$ spaces between/beyond these powers. We can either multiply $3$ with one of the powers, or place $3$ in the spaces between/beyond the powers (so that we have a single $3$ in the product), giving a total of $6+8=14$ ways of decomposing $96$ into products greater than $1$.

The answer is then $\cdot 14=112$.

*~asops*
## Video Solution by OmegaLearn
https://youtu.be/8WrdYLw9_ns?t=995

*~pi_is_3.14*
## Video Solution by MathEx
https://www.youtube.com/watch?v=977F9lBb37E
## Video Solution
Video is 4:29 long Uses casework. https://youtu.be/fR3VL7g90QM
Mark888
## See Also
