# 2013 AMC 12B Problem 23

> This problem is the same as [2013 AMC 12B #23](https://artofproblemsolving.com/wiki/index.php/2013_AMC_12B_Problems) and [2013 AMC 10B #25](https://artofproblemsolving.com/wiki/index.php/2013_AMC_10B_Problems).
## Problem
Bernardo chooses a three-digit positive integer $N$ and writes both its base-5 and base-6 representations on a blackboard. Later LeRoy sees the two numbers Bernardo has written. Treating the two numbers as base-10 integers, he adds them to obtain an integer $S$. For example, if $N = 749$, Bernardo writes the numbers $10,\!444$ and $3,\!245$, and LeRoy obtains the sum $S = 13,\!689$. For how many choices of $N$ are the two rightmost digits of $S$, in order, the same as those of $2N$?

$\textbf{(A)}\ 5 \qquad\textbf{(B)}\ 10 \qquad\textbf{(C)}\ 15 \qquad\textbf{(D)}\ 20 \qquad\textbf{(E)}\ 25$
## Solution 1
First, we can examine the units digits of the number base 5 and base 6 and eliminate some possibilities.

Say that $N \equiv a \pmod{6}$

also that $N \equiv b \pmod{5}$

Substituting these equations into the question and setting the units digits of $2N$ and $S$ equal to each other, it can be seen that $b < 5$ (because otherwise $a$ and $b$ will have different parities), and thus $a=b$.
$N \equiv a \pmod{6}$,
$N \equiv  a \pmod{5}$,
$\implies N=a \pmod{30}$,
$0 \le a \le 4$

Therefore, $N$ can be written as  $30x+y$
and $2N$ can be written as $60x+2y$

Just keep in mind that $y$ can be one of five choices: $0, 1, 2, 3,$ or $4$, ;
Also, we have already found which digits of $y$ will add up into the units digits of $2N$.

Now, examine the tens digit, $x$ by using $\mod{25}$ and $\mod{36}$ to find the tens digit (units digits can be disregarded because $y=0,1,2,3,4$ will always work)
Then we take $N=30x+y\mod{25}$ and $\mod{36}$ to find the last two digits in the base $5$ and $6$ representation.


$$N \equiv 30x \pmod{36}$$


$$N \equiv 30x \equiv 5x \pmod{25}$$


Both of those must add up to


$$2N\equiv60x \pmod{100}$$


$$($33 \ge x \ge 4$)$$

Now, since $y=0,1,2,3,4$ will always work if $x$ works, then we can treat $x$ as a units digit instead of a tens digit in the respective bases and decrease the mods so that $x$ is now the units digit.


$$N \equiv 5x \pmod{6}$$




$$N \equiv 6x \equiv x \pmod{5}$$




$$2N\equiv 6x \pmod{10}$$


Say that $x=5m+n$ (m is between 0-6, n is 0-4 because of constraints on x)
Then


$$N \equiv 5m+n \pmod{5}$$




$$N \equiv 25m+5n \pmod{6}$$




$$2N\equiv30m + 6n \pmod{10}$$


and this simplifies to


$$N \equiv n \pmod{5}$$




$$N \equiv m+5n \pmod{6}$$


$$2N\equiv 6n \pmod{10}$$


From careful inspection, this is true when

$n=0, m=6$

$n=1, m=6$

$n=2, m=2$

$n=3, m=2$

$n=4, m=4$

This gives you $5$ choices for $x$, and $5$ choices for $y$, so the answer is
$5* 5 = \boxed{\textbf{(E) }25}$
## Solution 2
Notice that there are exactly $\cdot 6^2$ possible values of $N$. This means, in $\le N\le 999$, every possible combination of $2$ digits will happen exactly once. We know that $N=900,901,902,903,904$ work because $\equiv\dots00_5\equiv\dots00_6$.

We know for sure that the units digit will add perfectly every $30$ added or subtracted, because $\text{lcm }(5, 6)=30$. So we only have to care about cases of $N$ every $30$ subtracted. In each case, $2N$ subtracts $6$/adds $4$, $N_5$ subtracts $1$ and $N_6$ adds $1$ for the $10$'s digit.


$$\textbf{5 }\textcolor{red}{\text{ 0}}\text{ 4 3 2 1 0 }\textcolor{red}{\text{4}}\text{ 3 2 1 0 4 3 2 1 0 4 }\textcolor{red}{\text{3 2}}\text{ 1 0 4 3 2 1 0 4 3 2 }\textcolor{red}{\text{1}}$$


$$\textbf{6 }\textcolor{red}{\text{ 0}}\text{ 1 2 3 4 5 }\textcolor{red}{\text{0}}\text{ 1 2 3 4 5 0 1 2 3 4 }\textcolor{red}{\text{5 0}}\text{ 1 2 3 4 5 0 1 2 3 4 }\textcolor{red}{\text{5}}$$


$$\textbf{10}\textcolor{red}{\text{ 0}}\text{ 4 8 2 6 0 }\textcolor{red}{\text{4}}\text{ 8 2 6 0 4 8 2 6 0 4 }\textcolor{red}{\text{8 2}}\text{ 6 0 4 8 2 6 0 4 8 2 }\textcolor{red}{\text{6}}$$


As we can see, there are $5$ cases, including the original, that work. These are highlighted in $\textcolor{red}{\text{red}}$. So, thus, there are $5$ possibilities for each case, and $\cdot 5=\boxed{\textbf{(E) }25}$.
## Solution 3
Notice that $N_5$ ranges from $3$ to $5$ digits and $N_6$ ranges from $3$ to $4$ digits.

So we can let $N_5 = a_1b_1c_1d_1e_1$ and $N_6 = a_2b_2c_2d_2$.

$$S = 10000a_1 + 1000(b_1 + a_2) + 100(c_1 + b_2) + 10(d_1 + c_2) + e_1 + d_2.$$

 To make it easier to work with mod 100, we will let $N = 625a_1 + 125b_1 + 25c_1 + 5d_1 + e_1$ here. So we have:


$$2N \equiv S \pmod{100} \implies 2(625a_1 + 125b_1 + 25c_1 + 5d_1 + e_1) \equiv 10(d_1 + c_2) + e_1 + d_2 \pmod{100}.$$


$$50(a_1 + b_1 + c_1) + \cancel{10d_1} + 2e_1 \equiv \cancel{10d_1} + 10c_2 + e_1 + d_2 \pmod{100}.$$


$$50(a_1 + b_1 + c_1) + e_1 \equiv 10c_2 + d_2 \pmod{100}.$$



Now note that $50(a_1 + b_1 + c_1)$ and $10c_2$ will always end with zeros, so the only way for this expression to be true is if $e_1 = d_2.$


$$50(a_1 + b_1 + c_1) + \cancel{e_1} \equiv 10c_2 + \cancel{d_2} \pmod{100}$$


$$5(a_1 + b_1 + c_1) \equiv c_2 \pmod{10}.$$



So $c_2$ can either be $0$ or $5$.

Now we can express $N$ in its base-six and base-five forms and set them equal to each other:


$$625a_1 + 125b_1 + 25c_1 + 5d_1 + \cancel{d_2} = 216a_2 + 36b_2 + 6c_2 + \cancel{d_2}$$




$$5(125a_1 + 25b_1 + 5c_1 + d_1) = 6c_2 + 36(b_2 + 6a_2).$$



Since we established $5 \mid c_2$ (remember, $c_2$ can either be $0$ or $5$), for the right hand side to be a multiple of $5$, $5 \mid b_2 + 6a_2.$ So we have seven possible pairs for $a_2$ and $b_2$:


$$(a_2, b_2) \rightarrow (5,0), (4,1), (3,2), (2,3), (1,4), (0, 5), (0,0).$$

 But if we had $(0,0),$ then $N_6$ would only have two digits, and $N$ would not be a three digit number. And if we had $a_2 = 5,$ then $N$ would exceed $1000$ and also not be a three digit number. So we actually have five valid pairs: $(4,1), (3,2), (2,3), (1,4), (0, 5).$ Since a number in one base can be expressed in the other base in exactly one way, and the value of $c_2$ is dependent on $a_1, b_1,$ and $c_1,$ there is one solution $(a_1, b_1, c_1, d_1)$ for every $(a_2, b_2)$ in


$$N_5 =  625a_1 + 125b_1 + 25c_1 + 5d_1 + d_2 = N_6 =  216a_2 + 36b_2 + 6c_2 + d_2.$$



And for every pair we have, there are five choices for $e_1 = d_2$ (any integer from $0 - 4$). So the answer is $5 \cdot 5 = \boxed{25}.$

*~grogg007, Nafer*
## Solution 4
Observe that the maximum possible value of the sum of the last two digits of the base $5$ number and the base $6$ number is $44+55=99$.
Let $N \equiv a \pmod {25}$ and $N \equiv b \pmod {36}$.

If $a < \frac{25}{2}$, $2N \equiv 2a \pmod {25}$ and if $a > \frac{25}{2}$, $2N \equiv 2a - 25 \pmod {25}$.

Using the same logic for $b$, if $b < 18, 2N \equiv 2b \pmod {36}$, and in the other case $2N \equiv 2b - 36 \pmod {36}$.

We can do four cases:

Case 1: $a + b = 2a - 25 + 2b - 36 \implies a + b = 61$.

For this case, there is trivially only one possible solution, $(a, b) = (25, 36)$, which is equivalent to $(a, b) = (0, 0)$.

Case 2: $a + b = 2a - 25 + 2b \implies a + b = 25$.

Note that in this case, $a \geq 13$ must hold, and $b < 18$ must hold.
We find the possible ordered pairs to be: $(13, 12), (14, 11), (15, 10), ..., (24, 1)$ for a total of $12$ ordered pairs.

Case 3: $a + b = 2a + 2b - 36 \implies a + b = 36$.

Note that in this case, $b \geq 18$ must hold, and $a < 13$ must hold.
We find the possible ordered pairs to be: $(24, 12), (25, 11), (26, 10), ..., (35, 1)$ for a total of $12$ ordered pairs.

Case 4: $a + b = 2a + 2b$.

Trivially no solutions except $(a, b) = (0, 0)$, which matches the solution in Case 1, which makes this an overcount.

By CRT, each solution $(a, b)$ corresponds exactly one positive integer in a set of exactly $\text{lcm} (25, 36) = 900$ consecutive positive integers, and since there are $900$ positive integers between $100$ and $999$, our induction is complete, and our answer is $1 + 12 + 12 = \boxed{\textbf{(E) }25}$.

*~fidgetboss_4000*
## Video Solution
https://www.youtube.com/watch?v=tgCK-H5jsOE&t=497s
## See Also
