# 2023 AMC 12B Problem 15

> This problem is the same as [2023 AMC 10B #18](https://artofproblemsolving.com/wiki/index.php/2023_AMC_10B_Problems/Problem_18) and [2023 AMC 12B #15](https://artofproblemsolving.com/wiki/index.php/2023_AMC_12B_Problems/Problem_15).
## Problem
Suppose a, b, and c are positive integers such that$\frac{a}{14}+\frac{b}{15}=\frac{c}{210}.$Which of the following statements are necessarily true?

I. If $\gcd(a,14)=1$ or $\gcd(b,15)=1$ or both, then $\gcd(c,210)=1.$

II. If $\gcd(c,210)=1,$ then $\gcd(a,14)=1$ or $\gcd(b,15)=1$ or both.

III. $\gcd(c,210)=1$ if and only if $\gcd(a,14)=\gcd(b,15)=1.$

$\textbf{(A)}~\text{I, II, and III}\qquad\textbf{(B)}~\text{I only}\qquad\textbf{(C)}~\text{I and II only}\qquad\textbf{(D)}~\text{III only}\qquad\textbf{(E)}~\text{II and III only}$
## Solution 1 (Guess and check + Contrapositive)
We examine each of the conditions.

The first condition is false. A simple counterexample is $a=3$ and $b=5$. The corresponding value of c is 115. Since $\gcd(3,14)=1,$ condition I would imply that $\gcd(c,210)=1.$ However, $\gcd(115,210)$ is clearly not 1 (they share a common factor of 5). Condition I is false so that we can rule out choices A,B, and C.

We now decide between the two answer choices D and E. What differs between them is the validity of condition II, so it suffices to check II simply.

We look at statement II's contrapositive to prove it. The contrapositive states that if $\gcd(a,14)\neq1$ and $\gcd(b,15)\neq1,$ then $\gcd(c,210)\neq1.$ In other words, if a shares some common factor that is not 1 with 14 and b shares some common factor that is not 1 with 15, then c also shares a common factor that is not 1 with 210. Let's say that a=a'$\cdot$ n, where a' is a factor of 14 not equal to 1. (So a' is the common factor.)

We can rewrite the given equation as $15a+14b=c\implies15(a'n)+14$b=c. We can express 14 as a'$\cdot$ n', for some positive integer n' (this n' can be 1). We can factor a' out to get a'($15n$+bn')=c.

Since all values in this equation are integers, c must be divisible by a'. Since a' is a factor of 14, a' must also be a factor of 210, a multiple of 14. Therefore, we know that c shares a common factor with 210 (which is a'), so $\gcd(c,210)\neq1.$ This is what II states, so therefore II is true.

Thus, our answer is $\boxed{\textbf{(E) }\text{II and III only}}.$
*~Technodoggo*
*~AVM2023 (Minor Edits - Fixes in the first paragraph and grammar edits)*
## Solution 2
The equation given in the problem can be written as
 $$15 a + 14 b = c. \hspace{1cm} (1)$$

$\textbf{First, we prove that Statement I is not correct.}$

A counter example is $a = 1$ and $b = 3$.
Thus, {\rm gcd} (c, 210) = 3 $\neq 1.$

$\textbf{Second, we prove that Statement III is correct.}$

First, we prove the ``if'' part.

Suppose {\rm gcd}(a , 14) = 1 and {\rm gcd}(b, 15) = 1. However, {\rm gcd} (c, 210) $\neq 1.$

Thus, c must be divisible by at least one factor of 210. W.L.O.G, we assume c is divisible by 2.

Modulo 2 on Equation (1), we get that 2 | a.
This is a contradiction with the condition that {\rm gcd}(a , 14) = 1.
Therefore, the ``if'' part in Statement III is correct.

Second, we prove the ``only if'' part.

Suppose {\rm gcd} (c, 210) $\neq 1.$ Because 210 = 14 $\cdot 15,$ there must be one factor of 14 or 15 that divides c.
W.L.O.G, we assume there is a factor q > 1 of 14 that divides c.
Because {\rm gcd} (14, 15) = 1, we have {\rm gcd} (q, 15) = 1.
Modulo q on Equation (1), we have q | a.

Because q | 14, we have {\rm gcd}(a , 14) $\geq$ q > 1.

Analogously, we can prove that {\rm gcd}(b , 15) > 1.

$\textbf{Third, we prove that Statement II is correct.}$

This is simply a special case of the ``only if'' part of Statement III. So we omit the proof.

All analyses above imply
$\boxed{\textbf{(E) II and III only}}.$

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Solution 3 (Answer Choices)
It can easily be shown that statement I is false (a counterexample would be $a=1, b=5, c=85$), meaning the only viable answer choices are D and E. Since both of these answer choices include statement III, this means III is true. Since III is true, this actually implies that statement II is true, as III is just a stronger version of statement II (or its contrapositive, to be precise). Therefore the answer is
$\boxed{\textbf{(E) II and III only}}.$

*~SpencerD. ~edited by $A_MatheMagician$*
## Solution 4
First, we will show that statement I is false. A simple counterexample is $a=2$ and $b=2$. Then, c is even, and it is not relatively prime with 210.

Now, we will focus on statement III. It's pretty easy to realize that if either a isn't relatively prime to 14 or b isn't relatively prime to 15, it will always share factors with 210 because $c =15a+14b$ (think 15 $\cdot 14 + 14).$ Therefore, statement III must be true.

Since statement III is a stricter case of statement II, the last two statements are true, hence choose $\boxed{\textbf{(E) }\text{II and III only}}.$

*~xHypotenuse*
## Solution 5 (Rigorous)
The condition in the problem is equivalent to

$$
\begin{align*}
15 a + 14 b = c. \hspace{1cm}
\end{align*}
$$


From here we can use the properties of the greatest common divisor to get

$$\gcd(c, 14)=\gcd(15a+14b, 14)=\gcd(15a, 14)=\gcd(a, 14)$$

and

$$\gcd(c, 15)=\gcd(15a+14b, 15)=\gcd(14b, 15)=\gcd(b, 15)$$

From here it's not hard to get

$$\gcd(c, 210)=\gcd(c, 15)*\gcd(c, 14)=\gcd(a, 14)*\gcd(b, 15)$$

Hence $\gcd(c, 210)=1$ is equivalent to $\gcd(a, 14)=1$ and $\gcd(b, 15)=1.$ This means the answer must be $\boxed{\textbf{(E) }\text{II and III only}}.$

*~tsun26*
## Solution 6 (Intuitive Risking)
We know that $\frac{a}{14} + \frac{b}{15} = \frac{c}{210}$. So, therefore, $\frac{a + 14b}{15} = \frac{c}{1}$, and $15a + 14b = 210c$.

We could see that some value of $a$ and another value of $b$ gives a different value of $c$. [WLOG](https://artofproblemsolving.com/wiki/index.php/WLOG), we give an intuitive risk, saying that $a + b = c$. Our goal is to just prove statements, not find solutions.

Statement I:

If $\gcd(a,14) = 1$ or $\gcd(b,15) = 1$ or both, then $\gcd(c,210) = 1$.

We have $a + b = c$.

Then if $\gcd(a,14) = 1$, we say $a = 1$

So then $\gcd(b,14) \neq 1$, so we say $b = 2$.

$1 + 2 = 3$, and $\gcd(3,210) = 1$ is false. So statement I is incorrect.

Statement II:

If $\gcd(c,210) = 1$, then $\gcd(a,14) = 1$ or $\gcd(b,15) = 1$ or both.

We say  $a + b = c$.

For statement II, we need to prove that it works for every odd number that is a multiple of the first number that makes both $a$ and $b$ positive integers and $\gcd(c,210) = 1$.

This number is 9. The possible pair values for $a$ and $b$ are 5 and 4 respectively. If we try 27, we get for a and b can be 15 and 12. We clearly see this is a pattern, and to get to an odd multiple of 9 we just multiply the sums by the $n$th multiple of 9. Therefore statement II is always true.

Statement III:

$\gcd(c,210) = 1$ if and only if $\gcd(a,14) = \gcd(b,15) = 1$.

We say $a + b = c$

We prove this by contradiction.

Assume $\gcd(a,14) \neq \gcd(b,15) \neq 1$.

Then, that means $\gcd(c,210)$ is never equal to 1.

So if we take $a = 14$ and $b = 15$, we get that $\gcd(29,210) \neq 1$. This is obviously false, because 29 is prime.

Therefore statement III is also correct.

Only II and III are correct, leading us to answer choice $\boxed{\textbf{(E) }\text{II and III only}}.$

*~Pinotation*
## Solution 7 (Formal Logic Lattice)
Multiply the original equation by 210 to get $15a+14$b=c.

Denote the propositions A:=($\gcd(a,14)=1), B$:=($\gcd(b,15)=1), C$:=($\gcd(c,210)=1).$

Work on the lattice with set $\{ A,B,C \}$ with $\ge$ the order relation given by $\implies, \land$ the logical minimum (AND), $\lor$ the logical maximum (OR), $\equiv$ logical equivalence $\iff.$

$$I. A\lor B\ge C\iff (A\ge C)\land (B\ge C)$$

$$II. C\ge A\lor B$$

III. C$\equiv A\land B$

Note A$\land B\ge A\lor B,$ so $\mathbf{III}\implies \mathbf{II}.$ Also, $\mathbf{III}\land\mathbf{I}\implies A\equiv B\equiv C$ by the squeeze lemma. In our case A$\not\equiv B\implies\neg \mathbf{III}\lor \neg \mathbf{I} (a$t least one of these statements is false).
(The squeeze lemma refers to A$\land B\ge A\lor B\implies A\equiv B$ from decomposing $\mathbf{I}$ into A$\ge C\equiv A\land B \iff A\ge B$ and symmetrically B$\ge A.)$

But notice $\gcd(14,15)=1.$ Use multiplicativity $\gcd(x,y)=1\implies \gcd(z,xy)=\gcd(z,x)\gcd(z,y)$ and Euclidean algorithm $\gcd(x,y)=\gcd(x,y\pm x)$ to get

$$\gcd(c,210)=\gcd(15a+14b,14)\gcd(15a+14b,15)=\gcd(a,14)\gcd(b,15).$$

Since $\gcd$: $\mathbb{Z}\times \mathbb{Z}\to \mathbb{Z}_{\ge 0} \implies \gcd\ge 1,$ so $\gcd(c,210)=1\iff \gcd(a,14)=\gcd(b,15)=1.$ By the above, $\mathbf{III}$ is true, $\mathbf{II}$ is true, $\mathbf{I}$ is false, so the answer is $\boxed{\textbf{(E) }\text{II and III only}}.$
## Video Solution
https://youtu.be/pg1pyRa6C24?si=bOM1mQkWzkYZzfv_

*~MathProblemSolvingSkills.com*
## Video Solution 2 by OmegaLearn
https://youtu.be/kky_f4JK7y8
## Video Solution
https://youtu.be/HxP-1TrwDdM

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See Also
