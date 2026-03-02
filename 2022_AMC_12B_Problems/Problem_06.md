# 2022 AMC 12B Problem 6

> This problem is the same as [2022 AMC 10B #8](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_8) and [2022 AMC 12B #6](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_6).
## Problem
Consider the following $100$ sets of $10$ elements each:


$$\begin{align*}

$$
&\{1,2,3,\ldots,10\}, \\
&\{11,12,13,\ldots,20\},\\
&\{21,22,23,\ldots,30\},\\
&\vdots\\
&\{991,992,993,\ldots,1000\}.
$$

$\end{align*}$$$


How many of these sets contain exactly two multiples of $7$?

$\textbf{(A)}\ 40\qquad\textbf{(B)}\ 42\qquad\textbf{(C)}\ 43\qquad\textbf{(D)}\ 49\qquad\textbf{(E)}\ 50$
## Solution 1 (Competition)
There are $\text{floor}\left(\frac{1000}{7}\right) = 142$ numbers divisible by 7. We split these into 100 sets containing 10 numbers each, giving us 1.42 multiples of 7 per set. After the first set, the numbers come evenly, and we multiply 100 by $1.42 - 1 = \boxed{\textbf{(B)}\ 42}.$

*~Pinotation*
## Solution 2 (Casework)
We apply casework to this problem. The only sets that contain two multiples of seven are those for which:

<ol style="margin-left: 1.5em;">
  <li>The multiples of $7$ are $\pmod{10}$ and $\pmod{10}.$ That is, the first and eighth elements of such sets are multiples of $7.$</li><p>
The first element is $1+10k$ for some integer $\leq \leq99.$ It is a multiple of $7$ when $k=2,9,16,\ldots,93.$
  <li>The multiples of $7$ are $\pmod{10}$ and $\pmod{10}.$ That is, the second and ninth elements of such sets are multiples of $7.$</li><p>
The second element is $2+10k$ for some integer $\leq \leq99.$ It is a multiple of $7$ when $k=4,11,18,\ldots,95.$
  <li>The multiples of $7$ are $\pmod{10}$ and $\pmod{10}.$ That is, the third and tenth elements of such sets are multiples of $7.$</li><p>
The third element is $3+10k$ for some integer $\leq \leq99.$ It is a multiple of $7$ when $k=6,13,20,\ldots,97.$
</ol>
Each case has $\left\lfloor\frac{100}{7}\right\rfloor=14$ sets. Therefore, the answer is $\cdot3=\boxed{\textbf{(B)}\ 42}.$

*~MRENTHUSIASM*
## Solution 3 (Find A Pattern)
We find a pattern.


$$\begin{align*}

$$
&\{1,2,3,\ldots,10\}, \\
&\{11,12,13,\ldots,20\},\\
&\{21,22,23,\ldots,30\},\\
&\vdots\\
&\{991,992,993,\ldots,1000\}.
$$

$\end{align*}$$$


We can figure out that the first set has $1$ multiple of $7$. The second set also has $1$ multiple of $7$. The third set has $2$ multiples of $7$. The fourth set has $1$ multiple of $7$. The fifth set has $2$ multiples of $7$. The sixth set has $1$ multiple of $7$. The seventh set has $1$ multiple of $7$. The eighth set has $2$ multiples of $7$. Disregarding the first set and then calculating this pattern further, we can see (reasonably) that it repeats for each $1$ sets.
We see that the pattern for the number of multiples per $7$ sets (again, disregarding the first set) goes: $1,2,1,2,1,1,2.$ So, for every $7$ sets after the first, there are three sets with $2$ multiples of $7$. We calculate $\left\lfloor\frac{100-1}{7}\right\rfloor$ and multiply that by $3$. (We also disregard the remainder of $1$ since it doesn't add any extra sets with $2$ multiples of $7$.). We get $\cdot3= \boxed{\textbf{(B) }42}$.

~(edited by) mihikamishra

~(edited by) MiniGlasses2009
## Solution 4 (Fastest)
Each set contains exactly $1$ or $2$ multiples of $7$ (Because it will need at least $2$ * $7$ = $14$ numbers in a group for $3$ or more multiples of $7$).

There are $\dfrac{1000}{10}=100$ total sets and $\left\lfloor\dfrac{1000}{7}\right\rfloor = 142$ multiples of $7$. Thus, there are $\boxed{\textbf{(B) }42}$ sets with $2$ multiples of $7$.

*~BrandonZhang202415*
~(edited by)DRA777
~(Minor edits by)DUODUOLUO
## Solution 5 (Simple Counting, Similar to Solution 1)
Consecutive multiples of $7$ must differ by $7$. So, if a set $\{\ldots1,\ldots2,\ldots3,(\ldots),\ldots8,\ldots9,\ldots0\}$ contains two multiples of $7$, they must end with the digits $1$ and $8$, $2$ and $9$, or $3$ and $0$. This reduces the problem to counting the amount of multiples of $7$ less than $1000$ that end with $1$, $2$, and $3$.

The first multiple of $7$ that ends with $1$ is $21$. The next multiple that ends with $1$ occurs $70$ later, since that is the smallest multiple of $7$ we can add to $21$ without affecting the last digit. The greatest number of $70$'s we can add to $21$ while keeping it less than $1000$ is $13$, because $21 + 70(13) = 931$. Therefore, the set of multiples of $7$ less than $1000$ ending with $1$ is $\{21 + 70(0), 21+70(1),\ldots,21+70(13)\}$, meaning there are $14$ of these particular multiples. We can use the same reasoning to count the multiples of $7$ that end with $2$ and $3$.

The first multiple of $7$ that ends with $2$ is $42$. The greatest number of $70$'s we can add to $42$ here is also $13$, since $42 + 70(13) = 952$. The set of multiples of $7$ less than $1000$ ending with $2$ is $\{42 + 70(0), 42+70(1),\ldots,42+70(13)\}$, giving $14$ multiples.

The first multiple of $7$ that ends with $3$ is $63$. The greatest number of $70$'s we can add to $63$ here is yet again $13$, since $63 + 70(13) = 973$. The set of multiples of $7$ less than $1000$ ending with $3$ is $\{63 + 70(0), 63+70(1),\ldots,63+70(13)\}$, giving another $14$ multiples.

In total, there are $14 + 14 + 14 = 42$ of these multiples, and so $\boxed{\textbf{(B) }42}$ sets with two multiples of $7$.

*~marsus16112*
## Solution 6 (Very Fast System of Equations)
Let $a$ be the number of sets with $1$ multiple of $7$ and $b$ be the number of sets with $2$ multiples of $7$. Note that it is impossible for a set to have more than two multiples of $7$.

Since there are a total of $100$ sets, $a+b=100$. Also, since there are $\lfloor \frac{1000}{7}\rfloor = 142$ multiples of $7$ between $1$ and $1000$, we must have $a+2b=142$.

Solving the system of equations


$$a+b=100$$


$$a+2b=142$$


for $b$ gives us the answer of $\boxed{\textbf{(B) }42}$.

*~FIREDRAGONMATH16*
*~scrares (minor edit)*
## Solution 7 (reasonable count)
(Similar to Solution 3, but a little more intuitive and less numbers.) Note that this system loops every cycle of length $70$, or $7$ such sets. From $1$ to $70$, the multiples of $7$ are $7$, $1$4, 21, 28, 35, 42, 49, 56, $63$, and $70$; note that $(21,28),(42,49),$ and $(63,70)$ are in the same sets. Thus, for every $7$ sets, we have $3$ sets with exactly two multiples of $7$. We have $100$ sets, which is $\cdot14+2$; the first $98$ sets contain $\dfrac37(7\cdot14)=42$ desired sets. The last two sets comprise the integers from $9$81 to $999$; the multiples of $7$ here are $987$ and $994$. Neither of the two last sets contains two multiples of $7$, so our answer is simply $\boxed{\textbf{(D) }42}$.

*~Technodoggo*
## Video Solution (🚀Under 3 min🚀)
https://youtu.be/PdyKJ1p9Y2w

*~Education, the Study of Everything*
## Video Solution(1-16)
https://youtu.be/SCwQ9jUfr0g

~~Hayabusa1
## Video Solution by Interstigation
https://youtu.be/_KNR0JV5rdI?t=884
## See Also
