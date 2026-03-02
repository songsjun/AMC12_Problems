# 2022 AMC 12A Problem 24

> This problem is the same as [2022 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_24) and [2022 AMC 12A #24](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_24).
## Problem
How many strings of length $5$ formed from the digits $0$, $1$, 2, 3, $4$ are there such that for each $j \in \{1,2,3,4\}$, at least $j$ of the digits are less than $j$? (For example, $02214$ satisfies this condition
because it contains at least $1$ digit less than $1$, at least $2$ digits less than $2$, at least $3$ digits less
than $3$, and at least $4$ digits less than $4$. The string $23404$ does not satisfy the condition because it
does not contain at least $2$ digits less than $2$.)

$\textbf{(A) }500\qquad\textbf{(B) }625\qquad\textbf{(C) }1089\qquad\textbf{(D) }1199\qquad\textbf{(E) }1296$
## Solution 1 (Parking Functions)
For some $n$, let there be $n+1$ parking spaces counterclockwise in a circle. Consider a string of $n$ integers $c_1c_2 \ldots c_n$ each between $0$ and $n$, and let $n$ cars come into this circle so that the $i$th car tries to park at spot $c_i$, but if it is already taken then it instead keeps going counterclockwise and takes the next available spot. After this process, exactly one spot will remain empty.

Then the strings of $n$ numbers between $0$ and $n-1$ that contain at least $k$ integers $<k$ for $1 \leq k \leq n$ are exactly the set of strings that leave spot $n$ empty. Also note for any string $c_1c_2 \ldots c_n$, we can add $1$ to each $c_i$ (mod $n+1$) to shift the empty spot counterclockwise, meaning for each string there exists exactly one $j$ with $0 \leq j \leq n$ so that $(c_1+j)(c_2+j) \ldots (c_n+j)$ leaves spot $n$ empty. This gives there are $\frac{(n+1)^{n}}{n+1} = (n+1)^{n-1}$ such strings.

Plugging in $n = 5$ gives $\boxed{\textbf{(E) }1296}$ such strings.

*~oh54321*
## Solution 2 (Cheese)
Consider some string that satisfies the problem statement, with $a$ 0's, $b$ 1's, $c$ 2's, $d$ 3's, and $e$ 4's, so $a+b+c+d+e=5$. There are exactly $\dfrac{5!}{a!b!c!d!e!}$ ways to order the given string. This number will be divisible by 5 unless one of $a, b, c, d, e$ is $5$, which implies that the rest are $0$. This corresponds to the string having $5$ of one digit. But the only possible string that has $1$ distinct digit is $00000$. Thus, the number of strings must be $1 \pmod{5}$. The only answer choice that satisfies this is $\boxed{\textbf{(E) }1296}$.
## Solution 3 (Casework)
Note that a valid string must have at least one $0.$

We perform casework on the number of different digits such strings can have. For each string, we list the digits in ascending order, then consider permutations:
<ol style="margin-left: 1.5em;">
  <li>The string has $1$ different digit.</li><p>
The only possibility is $00000.$ <p>
<b>There is $\boldsymbol{1}$ string in this case.</b>
  <li>The string has $2$ different digits.</li><p>
We have the following table:


$$\begin{array}{c||c|c|c|c||c}
& & & & & \\ [-2.5ex]
$\textbf{Digits} & \boldsymbol{01} & \boldsymbol{02} & \boldsymbol{03} & \boldsymbol{04} & \textbf{Row's Count} \\ [0.5ex]$
$$\hline$$
& & & & & \\ [-1.5ex]

$$
& 00001 & 00002 & 00003 & 00004 & \hspace{2mm}4\cdot\frac{5!}{4!1!}=20 \\ [2ex]
& 00011 & 00022 & 00033 & & \hspace{2mm}3\cdot\frac{5!}{3!2!}=30 \\ [2ex]
& 00111 & 00222 & & & \hspace{2mm}2\cdot\frac{5!}{2!3!}=20 \\ [2ex]
& 01111 & & & & 1\cdot\frac{5!}{1!4!}=5 \\ [0.75ex]
$$

$\end{array}$$$


<b>There are $\boldsymbol{20+30+20+5=75}$ strings in this case.</b>
  <li>The string has $3$ different digits.</li><p>
We have the following table:


$$\begin{array}{c||c|c|c|c|c|c||c}
& & & & & & &  \\ [-2.5ex]
$\textbf{Digits} & \boldsymbol{012} & \boldsymbol{013} & \boldsymbol{014} & \boldsymbol{023} & \boldsymbol{024} & \boldsymbol{034} & \textbf{Row's Count} \\ [0.5ex]$
$$\hline$$
& & & & & & & \\ [-1.5ex]

$$
& 00012 & 00013 & 00014 & 00023 & 00024 & 00034 & \hspace{2mm}6\cdot\frac{5!}{3!1!1!}=120 \\ [2ex]
& 00112 & 00113 & 00114 & 00223 & 00224 & & \hspace{2mm}5\cdot\frac{5!}{2!2!1!}=150 \\ [2ex]
& 00122 & 00133 & & 00233 & & & 3\cdot\frac{5!}{2!1!2!}=90 \\ [2ex]
& 01112 & 01113 & 01114 & & & & 3\cdot\frac{5!}{1!3!1!}=60 \\ [2ex]
& 01122 & 01133 & & & & & 2\cdot\frac{5!}{1!2!2!}=60 \\ [2ex]
& 01222 & & & & & & 1\cdot\frac{5!}{1!1!3!}=20 \\ [0.75ex]
$$

$\end{array}$$$


<b>There are $\boldsymbol{120+150+90+60+60+20=500}$ strings in this case.</b>
  <li>The string has $4$ different digits.</li><p>
We have the following table:


$$\begin{array}{c||c|c|c|c}
& & & & \\ [-2.5ex]
$\textbf{Digits} & \boldsymbol{0123} & \boldsymbol{0124} & \boldsymbol{0134} & \boldsymbol{0234} \\ [0.5ex]$
$$\hline$$
& & & & \\ [-1.5ex]
& 00123 & 00124 & 00134 & 00234 \\ [2ex]
& 01123 & 01124 & 01134 & \\ [2ex]
& 01223 & 01224 & & \\ [2ex]
& 01233 & & & \\ [0.75ex]
$\end{array}$$$


<b>There are $\boldsymbol{10\cdot\frac{5!}{2!1!1!1!}=600}$ strings in this case.</b>
  <li>The string has $5$ different digits.</li><p>
<b>There are $\boldsymbol{5!=120}$ strings in this case.</b>
</ol>
Together, the answer is $\boxed{\textbf{(E) }1296}.$

*~MRENTHUSIASM*
## Solution 4 (Recursive Equations Approach)
Denote by $N \left( p, q \right)$ the number of $p$-digit strings formed by using numbers $0, 1, \cdots, q$, where for each $j \in \{1,2, \cdots , q\}$, at least $j$ of the digits are less than $j$.

We have the following recursive equation:


$$N \left( p, q \right)
= $\sum_{i = 0}^{p - q} \binom{p}{i} N \left($ p - i, q - 1 $\right)$ , \ $\forall$ \ p $\geq$ q \mbox{ and } q $\geq 1$


and the boundary condition $N \left( p, 0 \right) = 1$ for any $p \geq 0$.

By solving this recursive equation, for $q = 1$ and $p \geq q$, we get


$$\begin{align*}

$$
N \left( p , 1 \right)
& = \sum_{i = 0}^{p - 1} \binom{p}{i} N \left( p - i, 0 \right) \\
& = \sum_{i = 0}^{p - 1} \binom{p}{i} \\
& = \sum_{i = 0}^p \binom{p}{i} - \binom{p}{p} \\
$$

& $= 2^p - 1 .$
$\end{align*}$$$


For $q = 2$ and $p \geq q$, we get


$$\begin{align*}

$$
N \left( p , 2 \right)
& = \sum_{i = 0}^{p - 2} \binom{p}{i} N \left( p - i, 1 \right) \\
& = \sum_{i = 0}^{p - 2} \binom{p}{i} \left( 2^{p - i} - 1 \right) \\
& = \sum_{i = 0}^p \binom{p}{i} \left( 2^{p - i} - 1 \right)
- \sum_{i = p - 1}^p \binom{p}{i} \left( 2^{p - i} - 1 \right) \\
& = \sum_{i = 0}^p \left( \binom{p}{i} 1^i 2^{p - i} - \binom{p}{i} 1^i 1^{p - i} \right)
$$

- p \\
$$& = \left( 1 + 2 \right)^p - \left( 1 + 1 \right)^p - p \\$$
& $= 3^p - 2^p - p .$
$\end{align*}$$$


For $q = 3$ and $p \geq q$, we get


$$\begin{align*}

$$
N \left( p , 3 \right)
& = \sum_{i = 0}^{p - 3} \binom{p}{i} N \left( p - i, 2 \right) \\
& = \sum_{i = 0}^{p - 3} \binom{p}{i} \left( 3^{p - i} - 2^{p - i} - \left( p - i \right) \right) \\
& = \sum_{i = 0}^p \binom{p}{i} \left( 3^{p - i} - 2^{p - i} - \left( p - i \right) \right)
- \sum_{i = p - 2}^p \binom{p}{i} \left( 3^{p - i} - 2^{p - i} - \left( p - i \right) \right) \\
& = \sum_{i = 0}^p \left( \binom{p}{i} 1^i 3^{p - i} - \binom{p}{i} 1^i 2^{p - i}
- \binom{p}{i} \left( p - i \right) \right)
- \frac{3}{2} p \left( p - 1 \right) \\
& = \left( 1 + 3 \right)^p - \left( 1 + 2 \right)^p
- \frac{d \left( 1 + x \right)^p}{dx} \bigg|_{x = 1}
- \frac{3}{2} p \left( p - 1 \right) \\
& = 4^p - 3^p - 2^{p-1} p - \frac{3}{2} p \left( p - 1 \right) .
$$

$\end{align*}$$$


For $q = 4$ and $p = 5$, we get


$$\begin{align*}

$$
N \left( 5 , 4 \right)
& = \sum_{i = 0}^1 \binom{5}{i} N \left( 5 - i , 3 \right) \\
& = N \left( 5 , 3 \right) + 5 N \left( 4 , 3 \right) \\
& = \boxed{\textbf{(E) }1296}  .
$$

$\end{align*}$$$


*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Solution 6 (Observations)
The number of strings is $(n+1)^{(n-1)}$ as shown by Solution 1 (Parking Function), which is always equivalent to 1 (mod n). Thus you can choose $\boxed{\textbf{(E) }1296}$.

However, you **CANNOT** prove that fact from this *incorrect* argument:

Let the set of all valid sequences be $S$.
Notice that for any sequence $\{a_1,a_2,a_3,a_4,a_5\}$ in $S$, the 5 cyclic permutations


$$\begin{align*}

$$
\{a_1,a_2,a_3,a_4,a_5\}\\
\{a_2,a_3,a_4,a_5,a_1\}\\
\{a_3,a_4,a_5,a_1,a_2\}\\
\{a_4,a_5,a_1,a_2,a_3\}\\
\{a_5,a_1,a_2,a_3,a_4\}
$$

$\end{align*}$$$


must also belong in $S$. However, one must consider the edge case all 5 elements are the same (only $\{0,0,0,0,0\}$), in which case all sequences listed are equivalent.

Alas, one must also consider cases like 10101 that only have 3 distinct cyclic permutations, so we cannot get a useful constraint from this view, unless *all* the cases are categorized and counted.

Thus it is NOT implied that $\lvert S \rvert \equiv 1  \pmod 5$, so it is not justified to choose $\boxed{\textbf{(E) }1296}$ by inspection of answer options.

If you solve $S(n)$ for smaller $n$ by bashing, you can find $|S(1)| =1, |S(2)| = 3, |S(3)| =16, |S(4)| =125$,
which leads to an Engineer's Induction guess that $|S(n)| \equiv 1 \pmod n$, or the exact formula $(n+1)^{(n-1)}$

*~idea by Tau, logic corrected by oinava*

Note:
I'm pretty sure this solution works. Firstly, 10101 does have 5 distinct cyclic permutations, namely 10101, 11010, 01101, 10110, and 01011. Secondly, any sequence of 5 elements must have either 1 or a multiple of 5 distinct cyclic permutations. If a sequence of 5 elements has only 1 cyclic permutation, that must be the case with $(0, 0, 0, 0, 0)$, as noted (since 0 is necessary in our sequence when $j = 1$). If the sequence is cyclic every $k$ "rotations/shifts," then it is ONLY going to be at the starting sequence when you shift it $0, k, 2k, \dots$ times. Since shifting any sequence 5 times takes it back to itself, we must have $k \mid 5 \implies k = 5$ (since we already considered $k = 1$ with $(0, 0, 0, 0, 0)$), so the cycle must be $5$. So really, this solution does work, is not by coincidence, and is a very nice (albeit cheap) solution.

TL;DR: The sentence "Alas, one must also consider cases like 10101 that only have 3 distinct cyclic permutations" is incorrect, for these cases do not actually exist. It's trivial to check 10101 has 5 cyclic permutations.
## Solution 5 (Mod 5 Trick Redeemed)
Solution 4 tried to observe the answer modulo $5$ to easily solve the problem, but apparently had faulty logic. This solution is still completely viable though:

Notice that for any valid set $\{a_1, a_2, a_3, a_4, a_5\}$, if there is at least one element in the set that is unique (i.e. there is at least one digit in the set that is found nowhere else in the set), then the number of distinct permutations of the set is clearly divisible by $5$ (alternatively there is no factor of 5 in the denominator of the multinomial coefficient unless an element is repeated 5 times). Therefore to evaluate the answer modulo $5$, we only need to look at sets where each element has a multiplicity of at least $2$ (i.e. appears twice or more in the set).

These sets are of the form $\{a,a,b,b,b\}$ and $\{a,a,a,a,a\}$. The first set can be permuted in $\binom{5}{2,3}=10 \equiv 0\pmod{5}$, and the second set can be permuted one way, and the only set of the form $\{a,a,a,a,a\}$ is $\{0,0,0,0,0\}$. Therefore the answer is congruent to $\pmod{5}$ and you CAN choose $\boxed{\textbf{(E) }1296}$.

*~SpencerD.*
## Solution 7 (Casework Bash)
We list out all possibilities for the string, sorted in increasing order. Note that 1 cannot appear before the 2nd position, 2 cannot appear before the 3rd position, and so on. We also make a list of the number of possible permutations of each sorted string.

00000 - 1

00001 - 5

00002 - 5

00003 - 5

00004 - 5

00011 - 10

00012 - 20

00013 - 20

00014 - 20

00022 - 10

00023 - 20

00024 - 20

00033 - 10

00034 - 20

00111 - 10

00112 - 30

00113 - 30

00114 - 30

00122 - 30

00123 - 60

00124 - 60

00133 - 30

00134 - 60

00222 - 10

00223 - 30

00224 - 30

00233 - 30

00234 - 60

01111 - 5

01112 - 20

01113 - 20

01114 - 20

01122 - 30

01123 - 60

01124 - 60

01133 - 30

01134 - 60

01222 - 20

01223 - 60

01224 - 60

01233 - 60

01234 - 120


Finally, adding all of these up, we obtain $\cdot 1+5\cdot 5+5\cdot 10+10\cdot 20+10\cdot 30 + 10\cdot 60 + 1\cdot 120 = \boxed{\textbf{(E) }1296}$. (Or alternatively, we could notice as in solution 5 that the only possible string with only 1 permutation is 00000, and thus the answer must be congruent to 1 modulo 5)

The key to organizing all of these cases is to increase the digits one by one, starting from the right and iterating through all the possible cases.

*~MathHayden*
## Solution 8 (Complementary Counting)
Let us call the condition where you require at least $j$ digits less than $j$ Rule $j$.
For a sequence to break Rule $1$, it must contain no $0$s. There are $4^5=1024$ ways to do this.
For a sequence to break Rule $2$ but not Rule $1$, it must contain exactly 1 $0$. However, this one $0$ contributes toward completing the rule, meaning all other digits must be greater than $2$. After placing the one $0$ in any of $5$ slots, there are $4$ slots left with $3$ options each, giving a total of $5 \cdot 3^4 = 405$ ways.
For a sequence to break Rule $3$ but neither Rule $2$ or $1$, it must have two digits less than $2$ (either $(0, 0)$ or $(0, 1)$) and all other digits must be $3$ or $4$. There are a total of $30$ ways to arrange the first two digits and $2^3$ ways to arrange the latter three, leaving $240$ ways to do this.
Finally, for a sequence to only break rule $4$, it must have three digits less than $3$. They could be $(0, 1, 2)$ (60 arr.), $(0, 1, 1); (0, 0, 1); (0, 0, 2)$ ($30$ arr. each), or $(0, 0, 0)$ ($10$ arr.) This gives $160$ possible arrangements overall.

There are in total $5^5=3125$ possible arrangements, so by adding all of the invalid states together and subtracting from $3125$, we get our answer, which is $\boxed{\textbf{(E) }1296}$

*~Shadowleafy*

Great idea! ~Bigbrain_2009
## Solution 9 (Recursion)
We will use recursion to solve this problem. Let us break up the problem's condition into criteria, with criterion $k$ being the requirement that at least $k$ of the digits are less than $k$. Define $A_n$ as the number of strings of length $n$ formed from the digits $0, 1, 2, \dots, n-1$ such that at least $j$ of the digits are less than $j$ for all integers $j$; $1 \le j \le n-1$.

Note that the final criterion any string counted as apart of $A_{n-1}$ is required to meet is criterion $n-2$. However, all strings that $A_{n-1}$ counts will also meet criterion $n-1$. This is due to the maximum value of such strings' $n-1$ digits being $n-2$. Initially, we have $A_1 = 1$. We check cases and find $A_2 = 3$. To generate recursion, consider the compliment of the problem's condition. Without the condition, we are counting strings of length $n$ with $n$ choices for each digit. There are of course $n^n$ such strings. To count the number of strings that do not meet at least one criterion, we denote a string as $k$-bad if the first criterion the string violates is criterion $k$. For example, the string $33040$ is $3$-bad because it meets criteria 1 and 2, but violates criterion 3. Similarly, the string $13223$ is $1$-bad because it does contain 1 digit less than 1. We can count the number of strings that are $k$-bad by first choosing and assigning $k-1$ of the string's $n$ spots to a string counted as apart of $A_{k-1}$. This can be done in $\binom{n}{k-1} \cdot A_{k-1}$ ways. This $(k-1)$ digit string will meet all criteria up to criterion $k-1$. To ensure criterion $k$ is not met, we fill up the remaining $n-(k-1)$ spots with a digit from $k$ to $n-1$, inclusive. This can be done in $(n-k)^{n+1-k}$ ways. We sum over all integers $k$, $1 \le k \le n-1$ to count all strings that do not meet at least one criterion.


$$\sum_{k=1}^{n-1} \binom{n}{k-1} A_{k-1} (n-k)^{n+1-k}$$


This is the same as


$$\sum_{k=2}^{n} \binom{n}{k-2} A_{k-2} (n-k+1)^{n+2-k}=\sum_{k=2}^{n} \binom{n}{n+2-k} A_{k-2} (n-k+1)^{n+2-k}$$


We substitute $n+2-k$ for $k$ as the expression takes on the same set of values. We have


$$\sum_{k=2}^{n} \binom{n}{n+2-(n+2-k)} A_{(n+2-k)-2} (n-(n+2-k)+1)^{n+2-(n+2-k)} = \sum_{k=2}^{n} \binom{n}{k} A_{n-k} (k-1)^k$$


Therefore,


$$A_n = n^n - \sum_{k=2}^{n} \binom{n}{k} A_{n-k} (k-1)^k$$


Setting $A_0 = 1$ and $A_1 = 1$, we use the recursion to derive $A_2 = 3, A_3 = 16, A_4 = 125, A_5 = 1296$. In our problem, we were counting 5 digits strings. Thus, the answer is $\boxed{\textbf{(E) }1296}$

*~sutirth_hazra*
## Video Solution by Math-X (Smart and Simple)
https://youtu.be/7yAh4MtJ8a8?si=aBXOzKzoAZwkb4l1&t=9314

*~Math-X*
## Video Solution
https://youtu.be/130OKAfG_-o

*~MathProblemSolvingSkills.com*
## Video Solution
https://youtu.be/mj78e_LnkX0

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution By OmegaLearn using Complementary Counting
https://youtu.be/jWoxFT8hRn8

*~pi_is_3.14*
## See Also
