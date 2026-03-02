# 2020 AMC 12B Problem 21

> This problem is the same as [2020 AMC 10B #24](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #21](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
How many positive integers $n$ satisfy

$$\dfrac{n+1000}{70} = \lfloor \sqrt{n} \rfloor?$$

(Recall that $\lfloor \rfloor$ is the greatest integer not exceeding $x$.)

$\textbf{(A) } 2 \qquad\textbf{(B) } 4 \qquad\textbf{(C) } 6 \qquad\textbf{(D) } 30 \qquad\textbf{(E) } 32$
## Solution 1 (Fakesolve)
We can first consider the equation without a floor function:


$$\dfrac{n+1000}{70} = \sqrt{n}$$


Multiplying both sides by 70 and then squaring:


$$n^2 + 2000n + 1000000 = 4900n$$


Moving all terms to the left:


$$n^2 - 2900n + 1000000 = 0$$


Now we can determine the factors:


$$(n-400)(n-2500) = 0$$


This means that for $n = 400$ and $n = 2500$, the equation will hold without the floor function.

Now we can simply check the multiples of 70 around 400 and 2500 in the original equation, which we abbreviate as $L=R$.

For $n = 330, L=19$ but $18^2 < 330 < 19^2$ so $R=18$

For $n = 400,  L=20$ and  $R=20$

For $n = 470,  L=21,  R=21$

For $n = 540, L=22$ but $540 > 23^2$ so   $R=23$

Now we move to $n = 2500$

For $n = 2430,  L=49$ and $49^2 < 2430 < 50^2$ so $R=49$

For $n = 2360,  L=48$ and $48^2 < 2360 < 49^2$ so $R=48$

For $n = 2290,  L=47$ and $47^2 < 2360 < 48^2$ so  $R=47$

For $n = 2220, L=46$ but $47^2 < 2220$ so  $R=47$

For $n = 2500,  L=50$ and $R=50$

For $n = 2570, L=51$ but $2570 < 51^2$ so $R=50$

Therefore we have 6 total solutions, $n = 400, 470, 2290, 2360, 2430, 2500 = \boxed{\textbf{(C) 6}}$
## Solution 2
This is my first solution here, so please forgive me for any errors.

We are given that

$$\frac{n+1000}{70}=\lfloor\sqrt{n}\rfloor.$$


We know $\lfloor\sqrt{n}\rfloor$ must be an integer, which means that $n+1000$ is divisible by $7$0. As $\equiv 20\pmod{70}$, this means that $n\equiv 50\pmod{70}$, so we can write $n=70k+50$ for $k\in\mathbb{Z}$. Note that $n$ has to be nonnegative for $\sqrt{n}$ to be defined. Thus, $n = 70k + 50 \geq 0$. Simplifying this, we have $k \geq -5/7$. In other words, $k$ also has to be nonnegative.

Therefore,

$$\frac{n+1000}{70}=\frac{70k+1050}{70}=k+15=\lfloor\sqrt{70k+50}\rfloor.$$


Also, we can say that $\sqrt{70k+50}-1 < k+15$ and $k+15\leq\sqrt{70k+50}.$

Since $k$ is nonnegative, both sides of the second inequality are nonnegative, so we can square them to get $k^{2}+30k+225\leq70\implies k^{2}-40k+175\leq 0\implies (k-5)(k-35)\leq0\implies 5\leq \leq 35$.

Similarly, solving the first inequality gives us $k < \sqrt{155}$ or $k > \sqrt{155}.$

We know that $\sqrt{155}$ is larger than $12$ and smaller than $13$, so instead, we can say $k\leq 6$ or $k\geq 32$.

Combining this with $\leq \leq 35$, we get $k=5,6,32,33,34,35$ are all solutions for $k$ that give a valid solution for $n$, meaning that our answer is $\boxed{\textbf{(C) 6}}$.
*~Solution By Qqqwerw*
## Solution 3
We start with the given equation

$$\dfrac{n+1000}{70} = \lfloor \sqrt{n} \rfloor$$

From there, we can start with the general inequality that $\lfloor \sqrt{n} \rfloor \leq \sqrt{n} < \lfloor \sqrt{n} \rfloor + 1$. This means that

$$\dfrac{n+1000}{70} \leq \sqrt{n} < \dfrac{n+1070}{70}$$

Solving each inequality separately gives us two inequalities:

$$n - 70\sqrt{n} +1000 \leq 0 \rightarrow (\sqrt{n}-50)(\sqrt{n}-20)\leq 0 \rightarrow 20\leq \sqrt{n} \leq 50$$


$$n-70\sqrt{n}+1070 > 0 \rightarrow \sqrt{n} < 35-\sqrt{155} , \sqrt{n} > 35+\sqrt{155}$$

Simplifying and approximating decimals yields 2 solutions for one inequality and 4 for the other. Hence, the answer is $2+4 = \boxed{\textbf{(C) } 6}$.

*~Rekt4*
## Solution 4
Let $n$ be uniquely of the form $n=k^2+r$ where $0 \le r \le 2k \; \bigstar$. Then,

$$\frac{k^2+r+1000}{70} = k$$

 Rearranging and completeing the square gives

$$(k-35)^2 + r = 225$$



$$\Rightarrow r = (k-20)(50-k)\; \smiley$$

 This gives us

$$(k-35)^2 \le (k-35)^2+r=225 \le (k-35)^2 + 2k$$

 Solving the left inequality shows that $20 \le k \le 50$. Combing this with the right inequality gives that

$$(k-35)^2+r=225 \le (k-35)^2 + 2k \le (k-35)^2+100$$

 which implies either $k \ge 47$ or $k \le 23$. By directly computing the cases for $k = 20, 21, 22, 23, 47, 48, 49, 50$ using $\smiley$, it follows that only $k = 22, 23$ yield and invalid $r$ from $\bigstar$. Since each $k$ corresponds to one $r$ and thus to one $n$ (from $\smiley$ and the original form), there must be 6 such $n$.


*~the_jake314*
## Solution 5
Since the right-hand-side is an integer, so must be the left-hand-side. Therefore, we must have $n\equiv -20\pmod{70}$; let $n=70j-20$. The given equation becomes

$$j+14 = \lfloor \sqrt{70j-20} \rfloor$$


Since $\lfloor x \rfloor \leq x < \lfloor x \rfloor +1$ for all real $x$, we can take $x=\sqrt{70j-20}$ with $\lfloor x \rfloor =j+14$ to get


$$j+14 \leq \sqrt{70j-20} < j+15$$


We can square the inequality to get

$$196+28j+j^{2} \leq 70j-20 < 225 + 30j + j^{2}$$


The left inequality simplifies to $(j-36)(j-6) \leq 0$, which yields

$$6 \le j \le 36.$$


The right inequality simplifies to $(j-20)^2 - 155 > 0$, which yields

$$j < 20 - \sqrt{155} < 8 \quad \text{or} \quad j > 20 + \sqrt{155} > 32$$



Solving $j < 8$, and $6 \le j \le 36$, we get $6 \le j < 8$, for $2$ values $j\in \{6, 7\}$.

Solving $j >32$, and $6 \le j \le 36$, we get $32 < j \le 36$, for $4$ values $k\in \{33, \ldots , 36\}$.

Thus, our answer is $2 + 4 = \boxed{\textbf{(C) }6}$


*~KingRavi*
## Solution 6
Set $x=\sqrt{n}$ in the given equation and solve for $x$ to get $x^2 = 70 \cdot \lfloor x \rfloor - 1000. Set k = \lfloor x \rfloor \ge 0$; since $\lfloor x \rfloor^2 \le x^2 < (\lfloor x \rfloor + 1)^2$, we get

$$k^2 \le  70k - 1000 < k^2 + 2k + 1.$$


The left inequality simplifies to $(k-20)(k-50) \le 0$, which yields

$$20 \le k \le 50.$$


The right inequality simplifies to $(k-34)^2 > 155$, which yields

$$k < 34 - \sqrt{155} < 22 \quad \text{or} \quad k > 34 + \sqrt{155} > 46$$


Solving $k < 22$, and $20 \le k \le 50$, we get $20 \le k < 22$, for $2$ values $k\in \{20, 21\}$.

Solving $k >46$, and $20 \le k \le 50$, we get $46 < k \le 50$, for $4$ values $k\in \{47, \ldots , 50\}$.

Thus, our answer is $2 + 4 = \boxed{\textbf{(C) }6}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 7
If $n$ is a perfect square, we can write $n = k^2$ for a positive integer $k$, so $\lfloor \sqrt{n} \rfloor = \sqrt{n} = k.$ The given equation turns into


$$
\begin{align*}
\frac{k^2 + 1000}{70} &= k \\
k^2 - 70k + 1000 &= 0 \\
(k-20)(k-50) &= 0,
\end{align*}
$$


so $k = 20$ or $k= 50$, so $n = 400, 2500.$

If $n$ is not square, then we can say that, for a positive integer $k$, we have

$$
\begin{align*}
k^2 < &n < (k+1)^2 \\
k^2 + 1000 < &n + 1000  = 70\lfloor \sqrt{n} \rfloor = 70k< (k+1)^2 + 1000 \\
k^2 + 1000 < &70k < (k+1)^2 + 1000.
\end{align*}
$$


To solve this inequality, we take the intersection of the two solution sets to each of the two inequalities
$k^2 + 1000 < 70k$ and $70k < (k+1)^2 + 1000$. To solve the first one, we have


$$
\begin{align*}
k^2 - 70k + 1000 &< 0 \\
(k-20)(k-50) &< 0\\
\end{align*}
$$

$k\in (20, 50),$ because the portion of the parabola between its two roots will be negative.

The second inequality yields


$$
\begin{align*}
70k &< k^2 + 2k + 1 + 1000 \\
0 &< k^2 -68k + 1001.
\end{align*}
$$

This time, the inequality will hold for all portions of the parabola that are not on or between the its two roots, which are $34 + \sqrt{155}>46$ and $\sqrt{155}<22$ (they are roughly equal, but this is to ensure that we do not miss any solutions).

Notation wise, we need all integers $k$ such that


$$k \in \left(20, 50\right) \cap \left(-\infty,34 - \sqrt{155} \right)$$


or


$$k \in \left(20, 50\right) \cap \left(34 + \sqrt{155}, \infty \right).$$


For the first one, since our uppoer bound is a little less than $22$, the $k$ that works is $21$. For the second, our lower bound is a little more than $46$, so the $k$ that work are $47, 48,$ and  $49$.

$\boxed{\textbf{(C) }6}$ total solutions for $n$, since each value of $k$ corresponds to exactly one value of $n$.

*~Benedict T (countmath1)*
## Solution 8
First, express $\lfloor \sqrt{n} \rfloor = \sqrt{n} - \{\sqrt{n}\}$ and simplify the equation out:
$\newline$

$$
\begin{align*}
n + 1000 = 70 \sqrt{n} - 70 \{\sqrt{n}\} \newline
\end{align*}
$$

For simplicity, define $a = \sqrt{n}$.
Then, $a^2 + 1000 = 70a - 70 \{a\}$
Rearranging and factoring: $(a-20)(a-50) = -70 \{a\}$
We know that $0 \leq \{a\} < 1$, so we can set $\{a\} = 0$ to obtain $a = 20, 50 \implies n = 400, 2500$.
For the next solutions, we can use the quadratic formula on the equation $a^2 - 70a + (1000+70\{a\}) = 0$:
$\newline$

$$
\begin{align*}
a = 35 \pm \sqrt{1225 - (1000 + 70\{a\})} = 35 \pm \sqrt{225-70\{a\}}
\end{align*}
$$

$\newline$
Since $a = 35 \pm \sqrt{225 - 70\{a\}}$ must produce real values of $a$ that satisfy $\lfloor a \rfloor = a - \{a\}$, the expression inside the square root must correspond to a value of $a$ whose integer part stays consistent. Therefore, we only consider values of $\{a\}$ that make $a$ land near an integer, which happens when $\sqrt{225 - 70\{a\}}$ is close to an integer.
$\newline$
From earlier, we can use the bounds of $\{a\}$ to find out that $225-70\{a\}$ will approach a minimum of $225-70 = 155$ but never reach it. Now, we can just list out the perfect squares between 155 and 225, as setting $225-70\{a\}$ equal to that perfect square will result in an integer value of $a$ corresponding to an integer value of $n$.
$\newline$
The two perfect squares that satisfy these restrictions are $k = 13$ and $k = 14$. Then, $a = 35 \pm 14 \implies a = 49, 21$ and $a = 35 \pm 13 \implies a = 48, 22$.
$\newline$
We know that each value of $a = \sqrt{n}$ corresponds to exactly one value of $n$, so we have a total of $2 + 4 = \boxed{\textbf{(C) }6}$ total solutions for $n$.

*~cyberhacker*
## Video Solutions
### Video Solution 1
On The Spot STEM:
https://youtu.be/BEJybl9TLMA
### Video Solution 2
https://www.youtube.com/watch?v=VWeioXzQxVA&list=PLLCzevlMcsWNcTZEaxHe8VaccrhubDOlQ&index=9 ~ MathEx
### Video Solution 3 by the Beauty of Math
https://youtu.be/4RVYoeiyC4w?t=62
## See Also
